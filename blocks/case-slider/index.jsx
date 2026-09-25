import { PostRelationControl } from "@components/post-relation-control";
import { SliderContext } from "@components/slider/context";
import { Slide } from "@components/slider/slide";
import { Slider } from "@components/slider/slider";
import { SliderButton } from "@components/slider/slider-button";
import { SliderPagination } from "@components/slider/slider-pagination";
import { SliderWrapper } from "@components/slider/slider-wrapper";
import { useCurrentPost } from "@lib/hooks/use-current-post";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import {
  Notice,
  PanelBody,
  Spinner,
  ToggleControl,
} from "@wordpress/components";
import { useState } from "@wordpress/element";
import { ServerSideRender } from "@wordpress/server-side-render";
import { usePostCases } from "./lib/use-post-cases";

import metadata from "./block.json";
import "./index.scss";

const POST_TYPE = "cases";
const VALUE_KEY = "caseId";

/** Тип записи, для которой доступна панель кейсов текущего врача. */
const DOCTOR_POST_TYPE = "doctors";

/**
 * Панель «Настройки блока для записи».
 *
 * @param {Object}   props
 * @param {boolean}  props.enabled       - Значение атрибута includeRelatedCases.
 * @param {number}   props.postId        - ID редактируемого врача.
 * @param {number}   props.count         - Количество найденных кейсов.
 * @param {boolean}  props.isResolving   - Идёт ли запрос кейсов.
 * @param {boolean}  props.isUnavailable - Недоступен ли тип записи в REST API.
 * @param {Function} props.onToggle      - Переключает опцию.
 * @returns {import("react").JSX.Element}
 */
function RelatedCasesPanel({ enabled, postId, onToggle }) {
  const { slides, isResolving, isUnavailable } = usePostCases({
    postId,
    enabled,
  });

  const count = slides.length;

  return (
    <PanelBody title="Настройки блока для записи" initialOpen={false}>
      <ToggleControl
        label="Выбрать все кейсы"
        checked={enabled}
        onChange={onToggle}
        disabled={!postId}
      />
      {isUnavailable && (
        <Notice status="error" isDismissible={false}>
          Кейсы недоступны в REST API. Включите «Показывать в REST API» в
          настройках типа записи «Кейсы».
        </Notice>
      )}
      {enabled && isResolving && (
        <p className="case-slider-state">
          <Spinner />
          Загружаем данные…
        </p>
      )}
      {enabled && !isResolving && (
        <p className="case-slider-state">{`Загруженно строк: ${count}`}</p>
      )}
      {enabled && !isResolving && count === 0 && (
        <Notice status="warning" isDismissible={false}>
          У этой записи нет связанных данных — слайдер останется пустым.
        </Notice>
      )}
    </PanelBody>
  );
}

/**
 * Пространство настроек блока в сайдбаре: список кейсов.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @returns {import("react").JSX.Element}
 */
function EditorTools({ attributes, setAttributes }) {
  const { slides, taxonomy, includeRelatedCases } = attributes;
  const { postId, postType } = useCurrentPost();
  const isDoctor = postType === DOCTOR_POST_TYPE;

  return (
    <InspectorControls>
      <PanelBody title="Настройки блока" initialOpen>
        <PostRelationControl
          value={slides}
          onChange={(nextSlides) => setAttributes({ slides: nextSlides })}
          valueKey={VALUE_KEY}
          postType={POST_TYPE}
          taxonomy={taxonomy}
          addLabel="Добавить кейсы"
          taxonomyLabel="Категория"
          hint="Выберите кейсы, которые попадут в слайдер.
          Порядок в списке ниже определяет порядок слайдов."
        />
      </PanelBody>
      {isDoctor && (
        <RelatedCasesPanel
          postId={postId}
          enabled={includeRelatedCases}
          onToggle={(next) => setAttributes({ includeRelatedCases: next })}
        />
      )}
    </InspectorControls>
  );
}

/**
 * Виджет блока в редакторе.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @returns {import("react").JSX.Element}
 */
function CaseSliderWidget({ attributes, setAttributes }) {
  const { slides, includeRelatedCases } = attributes;
  const blockProps = useBlockProps();
  const [activeIndex, setActiveIndex] = useState(0);
  const { postId, postType } = useCurrentPost();
  const isDoctor = postType === DOCTOR_POST_TYPE;

  const enabled = isDoctor && includeRelatedCases;
  const { slides: relatedSlides } = usePostCases({ postId, enabled });

  const activeSlides = enabled ? relatedSlides : slides;
  const slidesKey = activeSlides.map((slide) => slide.caseId).join("-");

  const hasSlides = activeSlides.length > 0;

  return (
    <>
      <div {...blockProps}>
        {hasSlides && (
          <div className="case-slider">
            <SliderContext.Provider value={{ activeIndex, setActiveIndex }}>
              <Slider slidesKey={slidesKey} option="cases" perView={1}>
                <SliderWrapper>
                  {activeSlides.map((slide) => (
                    <Slide key={slide.caseId}>
                      <ServerSideRender
                        block="theme/case-list"
                        attributes={{ caseId: slide.caseId }}
                      />
                    </Slide>
                  ))}
                </SliderWrapper>
                <SliderPagination />
                <div className="swiper-navigation">
                  <SliderButton type="prev" />
                  <SliderButton type="next" />
                </div>
              </Slider>
            </SliderContext.Provider>
          </div>
        )}
        {!hasSlides && (
          <div
            className="case-slider-empty"
            aria-hidden="true"
            title="Кейсы не выбраны"
          />
        )}
      </div>
      <EditorTools attributes={attributes} setAttributes={setAttributes} />
    </>
  );
}

registerBlockType(metadata.name, {
  ...metadata,

  edit: function ({ attributes, setAttributes }) {
    return (
      <CaseSliderWidget attributes={attributes} setAttributes={setAttributes} />
    );
  },

  save: () => null,
});

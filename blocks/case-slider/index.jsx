import { PostRelationControl } from "@components/post-relation-control";
import { SliderContext } from "@components/slider/context";
import { Slide } from "@components/slider/slide";
import { Slider } from "@components/slider/slider";
import { SliderButton } from "@components/slider/slider-button";
import { SliderPagination } from "@components/slider/slider-pagination";
import { SliderWrapper } from "@components/slider/slider-wrapper";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { PanelBody } from "@wordpress/components";
import { useState } from "@wordpress/element";
import { ServerSideRender } from "@wordpress/server-side-render";

import metadata from "./block.json";
import "./index.scss";

const POST_TYPE = "cases";
const VALUE_KEY = "caseId";

/**
 * Пространство настроек блока в сайдбаре: список кейсов.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @returns {import("react").JSX.Element}
 */
function EditorTools({ attributes, setAttributes }) {
  const { slides, taxonomy } = attributes;

  return (
    <InspectorControls>
      <PanelBody title="Кейсы слайдера" initialOpen>
        <PostRelationControl
          value={slides}
          onChange={(nextSlides) => setAttributes({ slides: nextSlides })}
          valueKey={VALUE_KEY}
          postType={POST_TYPE}
          taxonomy={taxonomy}
          addLabel="Добавить кейсы"
          selectedLabel="Выбрано кейсов"
          taxonomyLabel="Категория"
          searchLabel="Поиск по названию"
          searchPlaceholder="Начните вводить название…"
          emptyLabel="Кейсы не найдены"
          emptySelectedLabel="Пока ничего не выбрано"
          hint="Выберите кейсы, которые попадут в слайдер.
            Порядок в списке ниже определяет порядок слайдов."
        />
      </PanelBody>
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
  const { slides } = attributes;
  const blockProps = useBlockProps();
  const [activeIndex, setActiveIndex] = useState(0);
  const slidesKey = slides.map((slide) => slide.caseId).join("-");

  const hasSlides = slides.length > 0;

  return (
    <>
      <div {...blockProps}>
        {hasSlides && (
          <div className="case-slider">
            <SliderContext.Provider value={{ activeIndex, setActiveIndex }}>
              <Slider slidesKey={slidesKey} option="cases" perView={1}>
                <SliderWrapper>
                  {slides.map((slide) => (
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

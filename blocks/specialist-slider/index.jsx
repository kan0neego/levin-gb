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
import "./editor.scss";
import "./index.scss";

const POST_TYPE = "doctors";
const TAXONOMY = "doctors_specialty";
const VALUE_KEY = "doctorId";

/**
 * Пространство настроек блока в сайдбаре: список специалистов.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @returns {import("react").JSX.Element}
 */
function EditorTools({ attributes, setAttributes }) {
  const { slides } = attributes;

  return (
    <InspectorControls>
      <PanelBody title="Специалисты слайдера" initialOpen>
        <PostRelationControl
          value={slides}
          onChange={(nextSlides) => setAttributes({ slides: nextSlides })}
          valueKey={VALUE_KEY}
          postType={POST_TYPE}
          taxonomy={TAXONOMY}
          addLabel="Добавить специалистов"
          selectedLabel="Выбрано специалистов"
          taxonomyLabel="Специальность"
          searchLabel="Поиск по имени"
          searchPlaceholder="Начните вводить имя…"
          emptyLabel="Специалисты не найдены"
          emptySelectedLabel="Пока ничего не выбрано"
          hint="Выберите специалистов, которые попадут в слайдер.
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
function SpecialistSliderWidget({ attributes, setAttributes }) {
  const { slides } = attributes;
  const blockProps = useBlockProps();
  const [activeIndex, setActiveIndex] = useState(0);
  const slidesKey = slides.map((slide) => slide.doctorId).join("-");

  const hasSlides = slides.length > 0;

  return (
    <>
      <div {...blockProps}>
        {hasSlides && (
          <div className="specialist-slider-wrapper">
            <div className="specialist-slider">
              <SliderContext.Provider value={{ activeIndex, setActiveIndex }}>
                <Slider slidesKey={slidesKey} option="specialist" perView={1}>
                  <SliderWrapper>
                    {slides.map((slide) => (
                      <Slide key={slide.doctorId}>
                        <ServerSideRender
                          block="theme/specialist-slide"
                          attributes={{ doctorId: slide.doctorId }}
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
          </div>
        )}
        {!hasSlides && (
          <div
            className="specialist-slider-empty"
            aria-hidden="true"
            title="Специалисты не выбраны"
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
      <SpecialistSliderWidget
        attributes={attributes}
        setAttributes={setAttributes}
      />
    );
  },

  save: () => null,
});

import { RichText } from "@wordpress/block-editor";
import { useContext, useState } from "@wordpress/element";
import { SliderContext } from "./context";
import { Slider } from "./slider";
import { SliderButton } from "./slider-button";
import { SliderPagination } from "./slider-pagination";
import { SliderWrapper } from "./slider-wrapper";

/**
 * Подпись текущего слайда. Значение хранится в медиа-элементе слайдера,
 * поэтому правка подписи обновляет исходный массив `media`.
 */
function SliderCaption({ ...props }) {
  const { media, setItems, activeIndex } = useContext(SliderContext);
  const value = media[activeIndex]?.caption ?? "";

  return (
    <div className="swiper-caption" {...props}>
      <div className="swiper-caption-content">
        <RichText
          value={value}
          tagName="div"
          className="swiper-caption-text"
          placeholder="Подпись изображения (опционально)"
          onChange={(text) => {
            const next = media.map((item, index) =>
              index === activeIndex ? { ...item, caption: text } : item,
            );
            setItems(next);
          }}
        />
      </div>
    </div>
  );
}

export function MediaSlider({ media, setItems, perView, children }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const context = { media, setItems, activeIndex, setActiveIndex };

  return (
    <SliderContext.Provider value={context}>
      <div className="media-slider">
        <Slider
          option="media"
          perView={perView}
          slidesKey={media.map((item) => item.id).join("-")}
        >
          <SliderWrapper>{children}</SliderWrapper>
          <SliderPagination className="line-pagination-overflow" />
          <SliderButton type="prev" />
          <SliderButton type="next" />
        </Slider>
        <SliderCaption />
      </div>
    </SliderContext.Provider>
  );
}

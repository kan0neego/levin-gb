import Thumbs from "../modules/thumbs";
import { POINTS } from "./const";

export default function (c) {
  const wrapper = document.querySelector(".specialist-slider-wrapper");

  return {
    loop: true,
    slidesPerView: 1,
    spaceBetween: "6%",
    modules: [Thumbs],
    scrollbar: {
      draggable: true,
      el: wrapper?.querySelector(".swiper-scrollbar") || null,
    },
    breakpoints: {
      [POINTS.xl]: {
        spaceBetween: "-0px",
      },
    },
  };
}

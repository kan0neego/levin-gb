import Thumbs from "../modules/thumbs";

export default function () {
  const wrapper = document.querySelector(".specialist-slider-wrapper");

  return {
    loop: false,
    slidesPerView: 1,
    spaceBetween: "6%",
    modules: [Thumbs],
    scrollbar: {
      draggable: true,
      el: wrapper?.querySelector(".swiper-scrollbar") || null,
    },
  };
}

import { Swiper } from "swiper";
import { Autoplay, Navigation, Pagination, Scrollbar } from "swiper/modules";
import Buttons from "./modules/buttons";
import Caption from "./modules/caption.js";

import "swiper/css";
import "./index.scss";
import "/node_modules/swiper/modules/pagination.css";
import "/node_modules/swiper/modules/scrollbar.css";

const defaultModules = [
  Navigation,
  Pagination,
  Caption,
  Scrollbar,
  Autoplay,
  Buttons,
];

export default async function slider(element, options) {
  const modules = defaultModules.concat(options?.modules ?? []);

  if (element.swiper) return null;

  const swiper = new Swiper(element, {
    init: true,
    loop: false,
    slidesPerView: "auto",

    spaceBetween: "6%",
    ...options,
    modules,
  });

  return swiper;
}

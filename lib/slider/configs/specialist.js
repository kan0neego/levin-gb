import Thumbs from "../modules/thumbs";
import { POINTS } from "./const";

export default function (c) {
	return {
		loop: true,
		slidesPerView: 1,
		spaceBetween: "6%",
		modules: [Thumbs],
		pagination: {
			clickable: true,
			el: c.parentElement.querySelector(".line-pagination"),
			type: "bullets",
		},
		breakpoints: {
			[POINTS.xl]: {
				spaceBetween: "-0px",
			},
		},
	};
}

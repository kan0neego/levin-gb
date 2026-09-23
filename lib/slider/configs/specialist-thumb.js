import { POINTS } from "./const";

export default function (c) {
	return {
		slidesPerView: 1,
		spaceBetween: "1.2%",
		watchSlidesProgress: true,

		breakpoints: {
			[POINTS.sm]: { slidesPerView: 2, slidesPerGroup: 2 },
			[POINTS.lg]: { slidesPerView: 3, slidesPerGroup: 3 },
			[POINTS.xl]: { slidesPerView: 4, slidesPerGroup: 4 },
		},
	};
}

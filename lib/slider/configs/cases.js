import { POINTS } from './const';

export default function (c) {

	return {
		loop: true,
		slidesPerView: 1.2,
		spaceBetween: '3%',
		pagination: {
			clickable: true,
			el: c.parentElement.querySelector('.line-pagination'),
			type: 'bullets',
		},
		breakpoints: {
			[POINTS.md]: {
				slidesPerView: 1,
				slidesPerPage: 3,
				spaceBetween: '3%',
			},
		},
	};
}

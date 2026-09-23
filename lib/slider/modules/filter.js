import { animate } from 'motion';

const animation = {
	exit: {
		keyframes: {
			opacity: [1, 0],
			transform: ['translateY(0px)', 'translateY(-12px)'],
		},
		options: {
			duration: 0.18,
			easing: 'ease-in',
		},
	},
	enter: {
		keyframes: {
			opacity: [0, 1],
			transform: ['translateY(12px)', 'translateY(0px)'],
		},
		options: {
			duration: 0.25,
			easing: 'ease-out',
		},
	},
};

const findFilterButtons = (sliderEl) => {
	if (!sliderEl) return [];
	if (!sliderEl.parentElement) return [];
	const filters = sliderEl.parentElement.querySelectorAll('[data-filter]');
	return Array.from(filters ?? []);
};

const getFilterValue = (button) => button?.dataset?.filter?.trim() ?? '';

const createFilterPredicate = (filterValue) => {
	const className = filterValue.replace(/^\./, '');

	return (slide) => {
		if (!filterValue) return true;

		try {
			return (
				slide.matches(filterValue) || !!slide.querySelector(filterValue)
			);
		} catch (err) {
			return slide.classList.contains(className);
		}
	};
};

const slideFromHTML = (html) => {
	const wrapper = document.createElement('div');
	wrapper.innerHTML = html;
	return wrapper.firstElementChild;
};

const getOriginalSlides = (swiper) => {
	const sliders = Array.from(swiper.slides, (slide) => slide.outerHTML);
	return sliders;
};

const getDefaultButton = (buttons) =>
	buttons.find((button) => button.classList.contains('active')) ??
	buttons[0] ??
	null;

const toggleActiveButton = (buttons, activeButton) => {
	buttons.forEach((button) => {
		button.classList.toggle('active', button === activeButton);
	});
};

const animateSlides = (slides, keyframes, options = {}) => {
	if (!slides.length) return Promise.resolve();
	return Promise.all(
		slides.map((slide) => animate(slide, keyframes, options)),
	);
};


const applyFilter = async (swiper, originSlides, filterValue) => {
	const matches = createFilterPredicate(filterValue);
	const filtered = originSlides.filter((html) => matches(slideFromHTML(html)));
	const currentSlides = Array.from(swiper.slides);

	const { exit } = animation;
	await animateSlides(currentSlides, exit.keyframes, exit.options);

	swiper.removeAllSlides();
	if (filtered.length) swiper.appendSlide(filtered);
	swiper.update();
	swiper.slideTo(0, 0);

	const newSlides = Array.from(swiper.slides);
	const { enter } = animation;
	await animateSlides(newSlides, enter.keyframes, enter.options);
};

const bindFilterButtons = (buttons, onFilter) => {
	buttons.forEach((button) => {
		button.addEventListener('click', (event) => {
			event.preventDefault();
			onFilter(button);
		});
	});
};

const createFilterController = (swiper) => {
	const buttons = findFilterButtons(swiper.params.el);
	if (!buttons.length) return;

	const originalSlides = getOriginalSlides(swiper);
	let currentFilter = null;
	let isAnimating = false;

	const handleFilter = async (button) => {
		if (isAnimating) return;

		const filterValue = getFilterValue(button);
		if (filterValue === currentFilter) return;

		currentFilter = filterValue;
		toggleActiveButton(buttons, button);
		isAnimating = true;
		await applyFilter(swiper, originalSlides, filterValue);
		isAnimating = false;
	};

	bindFilterButtons(buttons, handleFilter);
	const defaultButton = getDefaultButton(buttons);
	if (defaultButton) {
		isAnimating = true;
		handleFilter(defaultButton);
		isAnimating = false;
	}
};

export default function Filter({ on }) {
	if (typeof on !== 'function') return null;

	on('init', createFilterController);
}

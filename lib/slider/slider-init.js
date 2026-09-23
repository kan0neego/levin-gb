export default async function module(container, options = {}) {
	const wrapper = container.querySelector(":scope > .swiper-wrapper");
	const dataset = container.dataset;
	const option =
		(await import(`@lib/slider/configs/${dataset.option}.js`)
			.then((m) => m.default(container))
			.catch(() => null)) ?? {};

	if (options.isEditor) {
		option.simulateTouch = false;
		option.allowTouchMove = false;
	}

	const slides = wrapper?.querySelectorAll(":scope > .swiper-slide") ?? [];
	const perViewKey = Object.keys(dataset).find((v) => v.includes("View"));
	const perView = option?.slidesPerView || parseInt(dataset[perViewKey]);

	let isInit = false;
	const init = (perView) => {
		if (slides.length > perView || (perView === "auto" && slides.length > 1)) {
			isInit = true;
			return;
		}
		isInit = false;
	};

	const breakpoints = option?.breakpoints;
	if (breakpoints) {
		for (const [key, value] of Object.entries(breakpoints)) {
			const breakpoint = window.matchMedia(`(min-width: ${key}px)`);
			if (breakpoint.matches) init(value.slidesPerView ?? perView);
			else init(perView);
		}
	} else init(perView);

	if (isInit) {
		return await import("@lib/slider/slider").then((module) => {
			return module.default(container, option);
		});
	}

	return null;
}

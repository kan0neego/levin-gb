import { useContext, useEffect, useRef } from "@wordpress/element";
import { SliderContext } from "./context";

export function Slider({
	option,
	thumb = null,
	perView,
	slidesKey,
	className,
	isEditor = true,
	children,
	...props
}) {
	const containerRef = useRef(null);
	const { setActiveIndex } = useContext(SliderContext);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		setActiveIndex(0);
		let cancelled = false;

		import("@lib/slider/slider-init").then(async ({ default: initSlider }) => {
			if (cancelled) return;
			const swiper = await initSlider(el, { isEditor });
			if (!swiper || cancelled) return;

			el.swiper = swiper;
			const { realIndex } = swiper;
			setActiveIndex(realIndex);
			swiper.on("realIndexChange", (event) => setActiveIndex(event.realIndex));
		});

		return () => {
			cancelled = true;
			const swiper = el.swiper;

			if (swiper) {
				swiper.destroy(true, true);
				delete el.swiper;
			}
		};
	}, [slidesKey, setActiveIndex]);

	return (
		<div
			ref={containerRef}
			className="slider-container"
			data-option={option}
			data-thumb={thumb}
			data-per-view={perView}
			{...props}
		>
			{children}
		</div>
	);
}

import { ArrowShotIcon } from "../icons/arrow-shot";

export function SliderButton({ type, icon, className, ...props }) {
	return (
		<button
			type="button"
			data-button={type}
			className={["btn-slider", `btn-slider-${type}`, className]
				.filter(Boolean)
				.join(" ")}
			{...props}
		>
			<ArrowShotIcon />
		</button>
	);
}

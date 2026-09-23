export function Slide({ children, ...props }) {
	return (
		<div className="swiper-slide" {...props}>
			{children}
		</div>
	);
}

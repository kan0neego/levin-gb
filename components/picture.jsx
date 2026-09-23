export function Picture({ picture, ...props }) {
	return (
		<img
			{...picture?.default}
			{...(picture.x2 ? { srcSet: `${picture.x2.src} 2x` } : {})}
			loading="lazy"
			{...props}
		/>
	);
}

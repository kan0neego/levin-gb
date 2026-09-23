const hideShockContent = (el) => {
	const nodeList = el.querySelectorAll('.wp-block-image.shock');
	if (nodeList.length > 0) {
		import('@lib/shock-content/shock-content.js').then(
			(module) => {
				nodeList.forEach((element) => {
					module.default(element);
				});
			},
		);
	}
};

export default function ShockContent(_ref) {
	const { on } = _ref;

	on('init', (sl) => {
		sl.slides.forEach((el) => hideShockContent(el));
	});
}

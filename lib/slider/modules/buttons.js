const findButton = (element, selector) => {
	let button = null;

	let parent = element.parentElement;
	while (parent && !button) {
		const buttons = parent.querySelectorAll(`${selector}`);
		if (buttons.length > 0) {
			button = buttons[0];
		}
		parent = parent.parentElement;
	}

	return button;
};

export default function Buttons(_ref) {
	const { on, params } = _ref;
	if (typeof on !== 'function') return null;

	const { el } = params;
	const nextEl = findButton(el, '[data-button="next"]');
	const prevEl = findButton(el, '[data-button="prev"]');

	if (nextEl && prevEl) {
		params.navigation = { nextEl, prevEl };
		const buttons = [nextEl, prevEl];

		on('init', (sl) => {
			const { params } = sl;
			if (sl?.navigation && window.innerWidth >= 640) {
				buttons.forEach((btn) => (btn.style.display = 'flex'));
			}
		});

		on('update', (sl) => {
			const { params } = sl;
			const { slidesPerView } = params;
			if (sl.slides.length <= slidesPerView) {
				buttons.forEach((btn) => (btn.style.display = 'none'));
			} else {
				buttons.forEach((btn) => {
					if (btn.style.display !== 'none') return;
					btn.style.display = 'flex';
				});
			}
		});
	}
}

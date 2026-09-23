export default function Buttons(_ref) {
	const { on, params } = _ref;
	if (typeof on !== 'function') return null;

	const { el } = params;
	const nextEl = el.parentElement.querySelector('[data-button="next"]');
	const prevEl = el.parentElement.querySelector('[data-button="prev"]');

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

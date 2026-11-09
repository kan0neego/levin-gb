import { animate } from 'motion';

const breakpoints = [640];
const mobileQuery = `(max-width: ${breakpoints[0]}px)`;

const isMobile = () => window.matchMedia(mobileQuery).matches;

const getCurrentTab = (id, tabs) => {
	return tabs.filter((tab) => tab.id === id)[0];
};

const directChild = (parent, selector) => parent.querySelector(`:scope > ${selector}`);

export default function module(element) {
	const buttonsContainer = directChild(element, '[class*=buttons]');
	const tabsContainer = directChild(element, '[class*=tabs]');
	if (!buttonsContainer || !tabsContainer) return;

	const buttons = [...buttonsContainer.querySelectorAll(':scope > [data-tab]')];
	const tabs = [...tabsContainer.children];

	const unmorphe = () => tabs.forEach((tab) => tabsContainer.append(tab));
	const morphe = () => {
		buttons.forEach((el, index) => {
			const tabId = el.getAttribute('data-tab');
			const tab = tabs[index];
			if (!tab) return;
			if (tabId === tab.id) el.after(tab);
		});
	};

	function clear() {
		buttons.forEach(function (item) {
			item.classList.remove('active');
		});

		tabs.forEach(function (item) {
			item.classList.remove('tab-active');
			if (!isMobile()) {
				animate(item, { opacity: [1, 0] });
			}
		});
	}

	function setActive(btn, initial = false) {
		const tabId = btn.getAttribute('data-tab');
		const tab = getCurrentTab(tabId, tabs);
		if (!tab) return;

		if (!initial) clear();
		btn.classList.add('active');
		tab.classList.add('tab-active');
		if (initial || isMobile()) return;
		animate(tab, { opacity: [0, 1] }, { duration: 0.8 });
	}

	const active = buttons.filter((btn) => btn.classList.contains('active'));
	if (active.length > 0) setActive(active[0], true);

	buttons.forEach((item) => {
		item.addEventListener('click', () => {
			setActive(item);
		});
	});

	breakpoints.forEach((point) => {
		const breakpoint = window.matchMedia(`(max-width: ${point}px)`);
		if (breakpoint.matches) morphe();
		breakpoint.onchange = (matchMedia) => {
			if (matchMedia.matches) morphe();
			else unmorphe();
		};
	});
}

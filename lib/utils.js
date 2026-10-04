import $ from '~/scripts/app/shared/jquery.js';

function createScript(url, attr = {}) {
	const script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	if (attr.async) script.async = true;
	if (attr.defer) script.defer = true;
	if (attr.id) script.id = attr.id;
	if (attr.onload) script.onload = attr.onload;
	document.getElementsByTagName('head')[0].appendChild(script);
	return script;
}

function loadCss(url) {
	const link = document.createElement('link');
	link.type = 'text/css';
	link.rel = 'stylesheet';
	link.href = url;
	document.getElementsByTagName('head')[0].appendChild(link);
}

function preloadImages(images, callback) {
	const queue = [];
	images.forEach((element) => {
		element.removeAttribute('loading');

		const prom = new Promise((res, rej) => {
			if (element.complete) {
				res(true);
			} else {
				element.onload = () => res(true);
				element.onerror = () => rej(false);
			}
		});

		queue.push(prom);
	});

	Promise.all(queue)
		.then((res) => {
			callback(null, res);
		})
		.catch((reason) => {
			callback(reason, null);
		});
}

function getScrollbarWidth() {
	return window.innerWidth - document.documentElement.clientWidth;
}

const injectScrollbarWidth = () => {
	const w = getScrollbarWidth();
	document.documentElement.style.setProperty('--scrollbar-w', `${w}px`);
};

const injectVH = () => {
	const vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', `${vh}px`);
};

class Overlay {
	constructor() {
		this.id = 'overlay';
		this.overlay = null;
		this.injected = false;
	}

	createOverlay() {
		const overlay = document.getElementById(this.id);
		if (overlay) this.overlay = overlay;
		if (this.overlay) return this;
		const div = document.createElement('div');
		div.id = this.id;
		div.classList.add('overlay');
		this.overlay = div;
		return this;
	}

	appendChild() {
		if (this.overlay) {
			if (this.injected) return;
			this.injected = true;
			return document.body.appendChild(this.overlay);
		}
	}

	removeChild() {
		if (this.overlay) {
			this.overlay.remove();
			this.injected = false;
		}
	}

	get() {
		if (this.overlay) return this.overlay;
		this.createOverlay().appendChild();
		return this.overlay;
	}
}

function debounce(cb, timeout) {
	clearTimeout($.data(window, 'scrollTimer'));
	$.data(window, 'scrollTimer', setTimeout(cb, timeout || 700));
}

function getTransitionMS(el) {
	const styles = window.getComputedStyle(el);
	const transitionProp = styles.getPropertyValue('transition-duration');
	const transitionDuration = transitionProp
		.split(',')
		.map((val) => parseFloat(val.replace(/[^0-9\.]/g, '')))
		.reduce((prev, cur) => prev + cur, 0);

	return transitionDuration;
}

const getDeviceType = () => {
	const userAgent = navigator.userAgent.toLowerCase();
	const isMobile =
		/mobile|iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(
			userAgent,
		);

	if (isMobile) return 'mobile';
	else return 'desktop';
};

function isElementVisible(container, element) {
	const containerRect = container.getBoundingClientRect();
	const elementRect = element.getBoundingClientRect();
	return (
		elementRect.top >= containerRect.top &&
		elementRect.bottom <= containerRect.bottom
	);
}

const isTextContent = function () {
	return this.nodeType === 3;
};

const requireYMaps = async (url) => {
	await new Promise((resolve) => {
		if (typeof ymaps !== 'undefined') return resolve(ymaps);
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.async = true;
		script.onload = () => resolve(ymaps);
		document.head.appendChild(script);
	});
};

const formDataToObject = (data) => {
	const formObject = Object.fromEntries(data.entries());
	return formObject;
};

const overflow = (type) => {
	switch (type) {
		case 'hidden': {
			const device = getDeviceType();
			let margin = 0;
			if (device !== 'mobile') margin = getScrollbarWidth();
			document.documentElement.style.overflow = 'hidden';
			document.documentElement.style.marginRight = `${margin}px`;
			break;
		}
		case 'visible': {
			document.documentElement.style.overflow = '';
			document.documentElement.style.marginRight = '';
		}
	}
};

const clearFocus = () => {
	if (document.activeElement) {
		document.activeElement.blur();
	}
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export {
	clearFocus,
	createScript,
	debounce,
	delay,
	formDataToObject,
	getDeviceType,
	getScrollbarWidth,
	getTransitionMS,
	injectScrollbarWidth,
	injectVH,
	isElementVisible,
	isTextContent,
	loadCss,
	overflow,
	Overlay,
	preloadImages,
	requireYMaps
};


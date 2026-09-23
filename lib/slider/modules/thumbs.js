import { Swiper } from 'swiper';
import { Thumbs } from 'swiper/modules';

const getConfig = async (name) => {
	return await import(`@lib/slider/configs/${name}.js`)
		.then((m) => m.default())
		.catch((e) => {
			throw new Error(`Не найден конфиг для тумблера - ${name}`);
		});
};

const findThumb = (element, thumbId) => {
	let thumb = null;

	let parent = element.parentElement;
	while (parent && !thumb) {
		const thumbs = parent.querySelectorAll(`.${thumbId}`);
		if (thumbs.length > 0) {
			thumb = thumbs[0];
		}
		parent = parent.parentElement;
	}

	return thumb;
};

const getThumbSlider = async (thumb) => {
	if (thumb?.swiper) return thumb.swiper;
	const name = thumb.dataset.option;
	if (!name) throw new Error('Не определен data-аттрибут с именем конфига');
	const config = await getConfig(name);
	return new Swiper(thumb, { init: true, ...config });
};

export default async function ThumbsModule(_ref) {
	const { params, swiper } = _ref;
	const thumbId = params.el.dataset.thumb;
	const thumb = findThumb(params.el, thumbId);

	if (!thumb) return;

	params.init = false;

	try {
		const swiperThumb = await getThumbSlider(thumb);
		swiper.params.thumbs = { swiper: swiperThumb };
		Thumbs(_ref);
		swiper.init();
	} catch (e) {
		console.error(e);
	}
}

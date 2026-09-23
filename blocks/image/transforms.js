import { isEmpty } from "@lib/helpers/object";
import { createBlock } from "@wordpress/blocks";
import { dispatch } from "@wordpress/data";
import metadata from "./block.json";

/**
 * Преобразует сырые объекты медиа (выбор из библиотеки или REST-ответ аплоада)
 * в структуру элемента атрибута `media` блока `theme/image`.
 *
 * @param {Array} items Массив объектов вложения.
 * @return {Array} Элементы атрибута `media`.
 */
export const createImageItem = (items) => {
	const result = [];
	for (const item of items) {
		const { id, url } = item;
		const alt = item.alt ?? item.alt_text ?? "";
		if (!item.sizes && item.media_details.sizes) {
			const { media_details } = item;
			const { width, height } = media_details;
			if (isEmpty(media_details.sizes)) {
				const sizes = { full: { width, height, url } };
				result.push({ id, url, alt, sizes, caption: "" });
				continue;
			}
			const { sizes } = media_details;
			result.push({ id, url, alt, sizes, caption: "" });
			continue;
		}
		const sizes = item.sizes;
		result.push({ id, url, alt, sizes, caption: "" });
	}
	return result;
};

const isImageFile = (file) => file.type.startsWith("image/");
export const isDownload = (item) =>
	Boolean(item.id) && !item.url.includes("blob");

/**
 * Запускает загрузку файлов в медиабиблиотеку и по мере завершения обновляет
 * атрибут `media` у только что созданного блока (его `clientId` сохраняется при
 * вставке через `replaceBlocks`/`insertBlocks`).
 *
 * @param {File[]} files Файлы, сброшенные в редактор.
 * @param {Object} block Блок, созданный в `transform`.
 */
function uploadFiles(files, block) {
	// const { mediaUpload } = select("core/block-editor").getSettings();
	if (!mediaUpload) return;
	const uploaded = new Map();

	mediaUpload({
		filesList: files,
		allowedTypes: ["image"],
		multiple: true,
		onFileChange: (media) => {
			if (!media.every(isDownload)) return;
			const items = createImageItem(media);
			for (const item of items) uploaded.set(item.id, item);
			const next = Array.from(uploaded.values());
			const { updateBlockAttributes } = dispatch("core/block-editor");
			updateBlockAttributes(block.clientId, { media: next });
		},
		onError: (error) => {
			const message = error?.message || "Не удалось загрузить изображение.";
			dispatch("core/notices").createErrorNotice(message, {
				type: "snackbar",
				isDismissible: true,
			});
		},
	});
}

const transforms = {
	from: [
		{
			type: "files",
			priority: 0,
			isMatch: (files) => files.length > 0 && files.every(isImageFile),
			transform: (files) => {
				const block = createBlock(metadata.name, { media: [] });
				uploadFiles(files, block);
				return block;
			},
		},
	],
};

export { transforms };

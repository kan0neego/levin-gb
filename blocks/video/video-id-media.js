/**
 * Обложка, превью и ссылка из записи CPT videos.
 */

/**
 * @param {*} value
 * @return {string}
 */
function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * @param {Object} [attributes]
 * @return {boolean}
 */
function hasVideoCover(attributes) {
  const posterId = Number(attributes?.posterId) || 0;

  return posterId > 0 || text(attributes?.poster) !== "";
}

/**
 * @param {Object} [attributes]
 * @return {boolean}
 */
function hasVideoLink(attributes) {
  const id = Number(attributes?.id) || 0;

  return id > 0 || text(attributes?.url) !== "";
}

/**
 * Своё превью: выбранный файл или непустой URL.
 *
 * @param {Object} [attributes]
 * @return {boolean}
 */
function hasVideoPreview(attributes) {
  const previewId = Number(attributes?.previewId) || 0;

  return previewId > 0 || text(attributes?.preview) !== "";
}

/**
 * Нужно ли читать запись: videoId задан и не хватает обложки, превью или ссылки.
 *
 * @param {Object} [attributes]
 * @return {boolean}
 */
function needsVideoIdMedia(attributes) {
  const videoId = Number(attributes?.videoId) || 0;

  return (
    videoId > 0 &&
    (!hasVideoCover(attributes) ||
      !hasVideoPreview(attributes) ||
      !hasVideoLink(attributes))
  );
}

/**
 * Ссылка ролика из меты записи: файл, иначе внешний адрес.
 * Если файл выбран, пустой URL файла не подменяется внешней ссылкой.
 *
 * @param {number} fileId ID вложения video_file.
 * @param {string} fileUrl URL этого вложения.
 * @param {string} externalUrl Адрес video_url, уже приведённый к embed.
 * @return {{id: number, url: string}}
 */
function videoLinkFromMeta(fileId, fileUrl, externalUrl) {
  const id = Number(fileId) || 0;

  if (id > 0) {
    return {
      id,
      url: typeof fileUrl === "string" ? fileUrl : "",
    };
  }

  return {
    id: 0,
    url: typeof externalUrl === "string" ? externalUrl.trim() : "",
  };
}

/**
 * Подставляет в пустые поля обложку, превью и ссылку из снимка записи.
 * Остальные ключи не меняет. Без videoId или без снимка возвращает тот же объект.
 *
 * @param {Object} [attributes] Атрибуты блока.
 * @param {Object|null} [source] Поля loadVideoSource: poster, posterId, preview, previewId, id, url.
 * @return {Object}
 */
function fillVideoIdMedia(attributes, source) {
  const current =
    attributes && typeof attributes === "object" ? attributes : {};

  if (!needsVideoIdMedia(current) || !source || typeof source !== "object") {
    return current;
  }

  const next = { ...current };

  if (!hasVideoCover(current)) {
    next.posterId = Number(source.posterId) || 0;
    next.poster = typeof source.poster === "string" ? source.poster : "";
  }

  if (!hasVideoPreview(current)) {
    next.previewId = Number(source.previewId) || 0;
    next.preview = typeof source.preview === "string" ? source.preview : "";
  }

  if (!hasVideoLink(current)) {
    next.id = Number(source.id) || 0;
    next.url = typeof source.url === "string" ? source.url : "";
  }

  return next;
}

module.exports = {
  __esModule: true,
  hasVideoCover,
  hasVideoLink,
  hasVideoPreview,
  needsVideoIdMedia,
  videoLinkFromMeta,
  fillVideoIdMedia,
};

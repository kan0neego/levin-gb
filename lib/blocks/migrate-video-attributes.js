/**
 * Миграция theme/video: фоновый ролик из `url` + `isBackground`
 * переносится в атрибуты превью. Кадр лайтбокса в `url` очищается.
 *
 * Новые атрибуты обёртки (`videoId`, `doctorIds`) дописываются,
 * если в сохранённом блоке их ещё не было.
 */

const VIDEO_EXTENSIONS = /\.(mp4|webm|ogv|ogg|mov)(\?.*)?$/i;

const VIDEO_MIME_TYPES = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogv: "video/ogg",
  ogg: "video/ogg",
  mov: "video/quicktime",
};

/**
 * MIME превью по расширению URL. Для неизвестного расширения — video/mp4.
 *
 * @param {string} url URL файла.
 * @return {string}
 */
function mimeFromUrl(url) {
  const match = (url ?? "").match(/\.([^./?#]+)(?:\?.*)?$/);
  const extension = match ? match[1].toLowerCase() : "";

  return VIDEO_MIME_TYPES[extension] || "video/mp4";
}

/**
 * Старый блок: прямой файл лежит в `url`, флаг `isBackground` включён,
 * отдельного превью ещё нет. Внешние ссылки не переносятся.
 *
 * @param {Object} [attributes] Сырые атрибуты из комментария блока.
 * @return {boolean}
 */
function isLegacyBackgroundVideo(attributes) {
  const url = typeof attributes?.url === "string" ? attributes.url : "";

  return (
    Boolean(attributes?.isBackground) &&
    url !== "" &&
    !attributes?.preview &&
    VIDEO_EXTENSIONS.test(url)
  );
}

/**
 * @param {Object} [attributes] Атрибуты устаревшего блока.
 * @return {Object} Атрибуты текущей схемы.
 */
function migrateLegacyBackgroundVideo(attributes) {
  const source = attributes && typeof attributes === "object" ? attributes : {};

  if (!isLegacyBackgroundVideo(source)) {
    return { ...source };
  }

  const url = source.url;
  const mimeType =
    typeof source.mimeType === "string" && source.mimeType !== ""
      ? source.mimeType
      : mimeFromUrl(url);

  return {
    ...source,
    previewId: Number(source.id) || 0,
    preview: url,
    mimeType,
    id: 0,
    url: "",
    isBackground: false,
    videoId: Number(source.videoId) || 0,
    doctorIds: Array.isArray(source.doctorIds) ? source.doctorIds : [],
  };
}

module.exports = {
  __esModule: true,
  isLegacyBackgroundVideo,
  migrateLegacyBackgroundVideo,
};

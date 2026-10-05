/**
 * Форматирует размер файла в человекочитаемый вид (КБ/МБ).
 *
 * @param {number|string} bytes Размер в байтах.
 * @return {string} Строка вида «332 КБ» / «1.2 МБ» либо «—» при отсутствии данных.
 */
export function formatFileSize(bytes) {
  const value = Number(bytes);

  if (!Number.isFinite(value) || value <= 0) {
    return "—";
  }

  const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  const exponent = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const size = value / 1024 ** exponent;

  // Байты показываем целыми, остальное — с одним знаком после запятой.
  const rounded =
    exponent === 0 ? Math.round(size) : Math.round(size * 10) / 10;

  return `${rounded} ${units[exponent]}`;
}

/**
 * Возвращает имя файла из URL (последний сегмент пути без query-параметров).
 *
 * @param {string} url URL файла.
 * @return {string} Имя файла либо пустая строка.
 */
export function getFileNameFromUrl(url) {
  if (!url) {
    return "";
  }

  const withoutQuery = url.split("?")[0].split("#")[0];
  const segments = withoutQuery.split("/");

  return decodeURIComponent(segments[segments.length - 1] ?? "");
}

/**
 * Определяет MIME-тип медиа по расширению файла в URL.
 *
 * @param {string} url URL файла.
 * @return {string} MIME-тип либо пустая строка.
 */
export function getMimeTypeFromUrl(url) {
  const fileName = getFileNameFromUrl(url);
  const match = fileName.match(/\.([^.]+)$/);

  if (!match) {
    return "";
  }

  const extension = match[1].toLowerCase();

  const types = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    avif: "image/avif",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
  };

  return types[extension] ?? "";
}

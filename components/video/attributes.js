/** Ключи атрибутов базового видео. Остальное принадлежит обёртке проекта. */
export const VIDEO_ATTRIBUTE_KEYS = [
  "id",
  "url",
  "mimeType",
  "posterId",
  "poster",
  "previewId",
  "preview",
  "playMode",
  "caption",
  "isBackground",
  "width",
  "height",
];

const VIDEO_ATTRIBUTE_KEY_SET = new Set(VIDEO_ATTRIBUTE_KEYS);

export const EMPTY_COVER = {
  posterId: 0,
  poster: "",
};

export const EMPTY_FRAME = {
  id: 0,
  url: "",
};

export const EMPTY_PREVIEW = {
  previewId: 0,
  preview: "",
  mimeType: "",
  width: 0,
  height: 0,
};

/**
 * Медиа-атрибуты, которые сбрасываются вместе с выбором записи.
 * `playMode` и `caption` здесь нет: это настройки блока, не снимок меты.
 */
export const EMPTY_VIDEO_MEDIA = {
  ...EMPTY_COVER,
  ...EMPTY_FRAME,
  ...EMPTY_PREVIEW,
  isBackground: false,
};

/**
 * Оставляет в патче только ключи базового видео.
 *
 * @param {Object} patch Частичное обновление атрибутов.
 * @return {Object}
 */
export function pickVideoAttributes(patch) {
  const next = {};

  VIDEO_ATTRIBUTE_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      next[key] = patch[key];
    }
  });

  return next;
}

/**
 * Оставляет в патче только ключи обёртки.
 *
 * @param {Object} patch Частичное обновление атрибутов.
 * @return {Object}
 */
export function omitVideoAttributes(patch) {
  const next = {};

  Object.keys(patch).forEach((key) => {
    if (!VIDEO_ATTRIBUTE_KEY_SET.has(key)) {
      next[key] = patch[key];
    }
  });

  return next;
}

import apiFetch from "@wordpress/api-fetch";
import { store as coreStore } from "@wordpress/core-data";
import { resolveSelect } from "@wordpress/data";
import { videoLinkFromMeta } from "./video-id-media";

/** Соответствие расширений превью и MIME-типов. Как в редакторе видео. */
const VIDEO_MIME_TYPES = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogv: "video/ogg",
  ogg: "video/ogg",
  mov: "video/quicktime",
};

/**
 * ID вложения из сырого значения ACF: число, числовая строка или объект с ID.
 *
 * @param {*} value Значение поля.
 * @return {number}
 */
function attachmentId(value) {
  if (value && typeof value === "object") {
    return attachmentId(value.ID ?? value.id ?? 0);
  }

  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : 0;
}

/**
 * ID связанных врачей. ACF отдаёт массив чисел или объектов записи.
 *
 * @param {*} value Значение video_related_doctors.
 * @return {number[]}
 */
function doctorIdsFromMeta(value) {
  const list = Array.isArray(value) ? value : [];

  return list
    .map((item) => {
      if (item && typeof item === "object") {
        return attachmentId(item.ID ?? item.id ?? 0);
      }

      return attachmentId(item);
    })
    .filter((id) => id > 0);
}

/**
 * MIME-тип превью по расширению URL.
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
 * Embed-адрес для лайтбокса. Повторяет levin_video_embed_url() в теме:
 * страницы YouTube и Rutube в чужом iframe не открываются.
 *
 * @param {string} url Ссылка из поля video_url.
 * @return {string}
 */
export function embedVideoUrl(url) {
  const value = (url ?? "").trim();

  if (!value) {
    return "";
  }

  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    return value;
  }

  const host = parsed.hostname.replace(/^(?:www|m)\./, "").toLowerCase();
  const path = parsed.pathname || "";
  const rutube = path.match(/\/video\/(?:private\/)?([a-z0-9]+)/i);

  if (host === "rutube.ru" && rutube) {
    return `https://rutube.ru/play/embed/${rutube[1]}/?autoplay=1`;
  }

  let videoId = "";

  if (host === "youtu.be") {
    videoId = path.replace(/^\//, "").split("/")[0];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    videoId = parsed.searchParams.get("v") || "";

    if (!videoId) {
      const short = path.match(/\/(?:shorts|live)\/([\w-]+)/);
      videoId = short ? short[1] : "";
    }
  }

  if (/^[\w-]{6,}$/.test(videoId)) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }

  return value;
}

/**
 * Вложение из медиатеки. Ошибка одного файла не отменяет остальные поля.
 *
 * @param {number} id ID вложения.
 * @return {Promise<Object|null>}
 */
function getAttachment(id) {
  return resolveSelect(coreStore)
    .getEntityRecord("postType", "attachment", id)
    .catch(() => null);
}

/**
 * URL вложения из ответа REST.
 *
 * @param {Object|null} record Запись attachment.
 * @return {string}
 */
function mediaUrl(record) {
  return record?.source_url || record?.url || "";
}

/**
 * Снимок меты записи `videos` для атрибутов блока.
 *
 * `acf_format=light` фиксирует сырые ID вложений и врачей. Формат
 * `standard` применил бы return_format полей и вернул бы URL без ID.
 * `context=edit` читает черновики, которые показывает выбор записи.
 *
 * @param {number} videoId ID записи CPT videos.
 * @return {Promise<Object>} Атрибуты видео и doctorIds.
 */
export async function loadVideoSource(videoId) {
  const post = await apiFetch({
    path:
      `/wp/v2/videos/${videoId}` +
      "?context=edit&acf_format=light&_fields=id,acf",
  });
  const acf = post?.acf;

  if (!acf || typeof acf !== "object" || Array.isArray(acf)) {
    throw new Error("В ответе записи нет полей ACF.");
  }

  const posterId = attachmentId(acf.video_poster);
  const previewId = attachmentId(acf.video_videocover);
  const fileId = attachmentId(acf.video_file);
  const [posterMedia, previewMedia, fileMedia] = await Promise.all([
    posterId ? getAttachment(posterId) : null,
    previewId ? getAttachment(previewId) : null,
    fileId ? getAttachment(fileId) : null,
  ]);
  const preview = mediaUrl(previewMedia);
  const fileUrl = mediaUrl(fileMedia);
  const externalUrl = typeof acf.video_url === "string" ? acf.video_url : "";
  const link = videoLinkFromMeta(fileId, fileUrl, embedVideoUrl(externalUrl));

  return {
    doctorIds: doctorIdsFromMeta(acf.video_related_doctors),
    posterId,
    poster: mediaUrl(posterMedia),
    previewId,
    preview,
    mimeType: preview
      ? previewMedia?.mime_type || previewMedia?.mime || mimeFromUrl(preview)
      : "",
    width: previewMedia?.media_details?.width ?? previewMedia?.width ?? 0,
    height: previewMedia?.media_details?.height ?? previewMedia?.height ?? 0,
    id: link.id,
    url: link.url,
    isBackground: false,
  };
}

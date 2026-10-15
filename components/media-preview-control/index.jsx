import {
  MediaPlaceholder,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";
import { Button, Icon } from "@wordpress/components";
import { useEntityRecord } from "@wordpress/core-data";
import { closeSmall } from "@wordpress/icons";

import {
  formatFileSize,
  getFileNameFromUrl,
  getMimeTypeFromUrl,
  getSiteNameFromUrl,
} from "@/lib/helpers/media";

import "./index.scss";

/**
 * Определяет, является ли выбранное медиа видео: по MIME вложения,
 * по расширению URL или по разрешённым типам контрола.
 *
 * @param {string}   mimeType      MIME-тип вложения.
 * @param {string}   url           URL файла.
 * @param {string[]} allowedTypes  Разрешённые типы медиа.
 * @return {boolean}
 */
function isVideoMedia(mimeType, url, allowedTypes) {
  if ((mimeType || "").startsWith("video/")) {
    return true;
  }

  if ((getMimeTypeFromUrl(url) || "").startsWith("video/")) {
    return true;
  }

  return allowedTypes.length === 1 && allowedTypes[0] === "video";
}

/**
 * Контрол медиа с превью: в пустом состоянии показывает MediaPlaceholder,
 * после выбора — компактное превью с метаданными (название, тип, вес) и
 * кнопками замены/удаления.
 *
 * Для видео из медиабиблиотеки в thumb выводится иконка `video-alt3`.
 * Начальное состояние можно переопределить через `renderPlaceholder`.
 *
 * Данные вложения читаются из REST при наличии `value.id`; для медиа,
 * вставленного по URL, метаданные выводятся из самого URL (вес недоступен).
 *
 * @param {Object}   props
 * @param {Object}   props.value              - Текущее значение `{ id, url }`.
 * @param {Function} props.onChange           - Получает новое значение `{ id, url }`.
 * @param {Function} props.onDelete           - Удаление выбранного медиа.
 * @param {string}   props.label              - Подпись поля и заголовок плейсхолдера.
 * @param {string}   props.accept             - Атрибут `accept` для загрузки.
 * @param {Array}    props.allowedTypes       - Разрешённые типы медиа.
 * @param {string}   props.icon               - Иконка пустого состояния.
 * @param {Function} props.onSelectURL        - Выбор медиа по внешней ссылке.
 * @param {Function} props.renderPlaceholder  - Кастомный рендер пустого состояния.
 * @return {import("react").JSX.Element}
 */
export function MediaPreviewControl({
  value,
  onChange,
  onDelete,
  label = "Медиа",
  accept,
  allowedTypes = ["image"],
  icon,
  onSelectURL,
  renderPlaceholder,
}) {
  const id = value?.id ?? 0;
  const url = value?.url ?? "";
  const resolvedIcon =
    icon || (allowedTypes.includes("video") ? "video-alt3" : "format-image");

  const { record } = useEntityRecord("postType", "attachment", id, {
    enabled: Boolean(id),
  });

  const isExternalUrl = Boolean(url) && !id;
  const fileName = isExternalUrl
    ? getSiteNameFromUrl(url)
    : record?.title?.rendered || getFileNameFromUrl(url);
  const mimeType = record?.mime_type || getMimeTypeFromUrl(url);
  const fileSize = formatFileSize(record?.media_details?.filesize);
  const showVideoThumb = isVideoMedia(mimeType, url, allowedTypes);

  const selectMedia = (media) =>
    onChange({ id: media?.id ?? 0, url: media?.url ?? "" });

  const deleteMedia = () => {
    if (typeof onDelete === "function") {
      onDelete();
      return;
    }

    onChange({ id: 0, url: "" });
  };

  if (!url) {
    if (typeof renderPlaceholder === "function") {
      return renderPlaceholder({
        icon: resolvedIcon,
        label,
        accept,
        allowedTypes,
        onSelect: selectMedia,
        onSelectURL,
      });
    }

    return (
      <MediaPlaceholder
        icon={resolvedIcon}
        labels={{ title: label }}
        accept={accept}
        allowedTypes={allowedTypes}
        onSelect={selectMedia}
        onSelectURL={onSelectURL}
      />
    );
  }

  return (
    <div className="media-preview-control">
      <div
        className={`media-preview-control__thumb${
          showVideoThumb ? " is-video" : ""
        }`}
      >
        {showVideoThumb ? (
          <Icon icon="video-alt3" />
        ) : (
          <img src={url} alt="" loading="lazy" />
        )}
      </div>
      <div className="media-preview-control__meta">
        <div className="media-preview-control__name">{fileName}</div>
        <div className="media-preview-control__details">
          {isExternalUrl ? (
            <span className="media-preview-control__url">{url}</span>
          ) : (
            <>
              {mimeType && <span>{mimeType}</span>}
              <span>{fileSize}</span>
            </>
          )}
        </div>
        <div className="media-preview-control__actions">
          <MediaUploadCheck>
            <MediaUpload
              value={id}
              allowedTypes={allowedTypes}
              render={({ open }) => (
                <Button variant="secondary" size="small" onClick={open}>
                  Заменить
                </Button>
              )}
              onSelect={selectMedia}
            />
          </MediaUploadCheck>
          <Button
            variant="tertiary"
            size="small"
            icon={closeSmall}
            label="Удалить"
            onClick={deleteMedia}
          />
        </div>
      </div>
    </div>
  );
}

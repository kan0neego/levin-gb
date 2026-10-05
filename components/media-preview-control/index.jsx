import {
  MediaPlaceholder,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";
import { Button } from "@wordpress/components";
import { useEntityRecord } from "@wordpress/core-data";
import { closeSmall } from "@wordpress/icons";

import {
  formatFileSize,
  getFileNameFromUrl,
  getMimeTypeFromUrl,
} from "@/lib/helpers/media";

import "./index.scss";

/**
 * Контрол медиа с превью: в пустом состоянии показывает MediaPlaceholder,
 * после выбора — компактное превью с метаданными (название, тип, вес) и
 * кнопками замены/удаления.
 *
 * Данные вложения читаются из REST при наличии `value.id`; для медиа,
 * вставленного по URL, метаданные выводятся из самого URL (вес недоступен).
 *
 * @param {Object}   props
 * @param {Object}   props.value         - Текущее значение `{ id, url }`.
 * @param {Function} props.onChange      - Получает новое значение `{ id, url }`.
 * @param {string}   props.label         - Подпись поля и заголовок плейсхолдера.
 * @param {string}   props.accept        - Атрибут `accept` для загрузки.
 * @param {Array}    props.allowedTypes  - Разрешённые типы медиа.
 * @return {import("react").JSX.Element}
 */
export function MediaPreviewControl({
  value,
  onChange,
  label = "Медиа",
  accept,
  allowedTypes = ["image"],
}) {
  const id = value?.id ?? 0;
  const url = value?.url ?? "";

  const { record } = useEntityRecord("postType", "attachment", id, {
    enabled: Boolean(id),
  });

  const fileName = record?.title?.rendered || getFileNameFromUrl(url);
  const mimeType = record?.mime_type || getMimeTypeFromUrl(url);
  const fileSize = formatFileSize(record?.media_details?.filesize);

  const selectMedia = (media) =>
    onChange({ id: media?.id ?? 0, url: media?.url ?? "" });

  if (!url) {
    return (
      <MediaPlaceholder
        icon="format-image"
        labels={{ title: label }}
        accept={accept}
        allowedTypes={allowedTypes}
        onSelect={selectMedia}
      />
    );
  }

  return (
    <div className="media-preview-control">
      <div className="media-preview-control__thumb">
        <img src={url} alt="" loading="lazy" />
      </div>
      <div className="media-preview-control__meta">
        <div className="media-preview-control__name">{fileName}</div>
        <div className="media-preview-control__details">
          {mimeType && <span>{mimeType}</span>}
          <span>{fileSize}</span>
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
            onClick={() => onChange({ id: 0, url: "" })}
          />
        </div>
      </div>
    </div>
  );
}

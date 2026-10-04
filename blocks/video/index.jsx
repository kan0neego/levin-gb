import {
  BlockControls,
  MediaPlaceholder,
  MediaUpload,
  MediaUploadCheck,
  useBlockProps,
} from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { ToolbarButton, ToolbarGroup } from "@wordpress/components";
import metadata from "./block.json";
import "./index.scss";

/**
 * Извлекает из объекта вложения (выбор из медиабиблиотеки или REST-ответ)
 * значения атрибутов `id` и `url` блока `theme/video`.
 *
 * @param {Object} media Объект вложения.
 * @return {{id: number, url: string}} Значения атрибутов.
 */
function createVideoAttributes(media) {
  return {
    id: media?.id ?? 0,
    url: media?.url ?? "",
  };
}

/**
 * Панель инструментов блока: замена выбранного видео.
 *
 * @param {Object}   props
 * @param {number}   props.id            - ID выбранного вложения.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @return {import("react").JSX.Element}
 */
function EditorTools({ id, setAttributes }) {
  return (
    <BlockControls>
      <ToolbarGroup>
        <MediaUploadCheck>
          <MediaUpload
            value={id}
            allowedTypes={["video"]}
            render={({ open }) => (
              <ToolbarButton
                label="Заменить видео"
                icon="video-alt3"
                onClick={open}
              />
            )}
            onSelect={(media) => setAttributes(createVideoAttributes(media))}
          />
        </MediaUploadCheck>
      </ToolbarGroup>
    </BlockControls>
  );
}

/**
 * Кастомное отображение видео в редакторе: повторяет разметку render.php.
 *
 * @param {Object} props
 * @param {string} props.url - URL выбранного видео.
 * @return {import("react").JSX.Element}
 */
function VideoFigure({ url }) {
  return (
    <figure className="wp-block-video video-autoplay video-lightbox">
      <img className="video-poster" alt="" />
      <video className="video-content" muted loop playsInline>
        <source data-src={url} type="video/mp4" />
      </video>
    </figure>
  );
}

registerBlockType(metadata.name, {
  ...metadata,

  edit: function ({ attributes, setAttributes }) {
    const { id, url } = attributes;
    const blockProps = useBlockProps();
    const hasVideo = Boolean(url);

    return (
      <>
        <EditorTools id={id} setAttributes={setAttributes} />
        <div {...blockProps}>
          {!hasVideo && (
            <MediaPlaceholder
              icon="video-alt3"
              labels={{ title: "Видео" }}
              accept="video/*"
              allowedTypes={["video"]}
              onSelect={(media) => setAttributes(createVideoAttributes(media))}
              onSelectURL={(nextUrl) => setAttributes({ id: 0, url: nextUrl })}
            />
          )}
          {hasVideo && <VideoFigure url={url} />}
        </div>
      </>
    );
  },

  save: () => null,
});

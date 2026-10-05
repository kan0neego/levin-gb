import {
  BlockControls,
  InspectorControls,
  MediaPlaceholder,
  MediaUpload,
  MediaUploadCheck,
  useBlockProps,
} from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import {
  Button,
  PanelBody,
  SelectControl,
  ToolbarButton,
  ToolbarGroup,
} from "@wordpress/components";
import metadata from "./block.json";
import "./index.scss";

/** Расширения прямых ссылок на видеофайлы. */
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogv|ogg|mov)(\?.*)?$/i;

/** Соответствие расширений видеофайлов и их MIME-типов. */
const VIDEO_MIME_TYPES = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogv: "video/ogg",
  ogg: "video/ogg",
  mov: "video/quicktime",
};

/**
 * Определяет, является ли источник прямой ссылкой на видеофайл.
 * Всё остальное (YouTube, Vimeo, embed) считается внешним источником.
 *
 * @param {string} url URL источника.
 * @return {boolean} true — прямой файл, false — внешний источник.
 */
function isDirectVideo(url) {
  return VIDEO_EXTENSIONS.test(url ?? "");
}

/**
 * Определяет MIME-тип видео по расширению файла для атрибута `type` тега
 * `<source>`. Для неизвестных расширений используется `video/mp4`.
 *
 * @param {string} url URL источника.
 * @return {string} MIME-тип видео.
 */
function getVideoMimeType(url) {
  const match = (url ?? "").match(/\.([^./?#]+)(?:\?.*)?$/);
  const extension = match ? match[1].toLowerCase() : "";

  return VIDEO_MIME_TYPES[extension] ?? "video/mp4";
}

const PLAY_MODES = [
  { label: "Автовоспроизведение", value: "autoplay" },
  { label: "При наведении", value: "hover" },
];

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
 * Настройки блока в сайдбаре: режим воспроизведения и постер.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @return {import("react").JSX.Element}
 */
function InspectorTools({ attributes, setAttributes }) {
  const { playMode, posterId, poster } = attributes;

  return (
    <InspectorControls>
      <PanelBody title="Настройки отображения">
        <SelectControl
          label="Режим воспроизведения"
          value={playMode}
          options={PLAY_MODES}
          onChange={(value) => setAttributes({ playMode: value })}
        />
        <MediaUploadCheck>
          <MediaUpload
            value={posterId}
            allowedTypes={["image"]}
            render={({ open }) => (
              <Button variant="secondary" onClick={open}>
                {poster ? "Заменить постер" : "Выбрать постер"}
              </Button>
            )}
            onSelect={(media) =>
              setAttributes({
                posterId: media?.id ?? 0,
                poster: media?.url ?? "",
              })
            }
          />
        </MediaUploadCheck>
      </PanelBody>
    </InspectorControls>
  );
}

/**
 * Кастомное отображение видео в редакторе: повторяет разметку render.php.
 *
 * Прямая ссылка на файл рендерится в <video>, внешний источник — во фрейме
 * через fancybox (data-type="iframe").
 *
 * @param {Object} props
 * @param {string} props.url      - URL выбранного видео.
 * @param {string} props.poster   - URL постера.
 * @param {string} props.playMode - Режим воспроизведения.
 * @return {import("react").JSX.Element}
 */
function VideoFigure({ url, poster, playMode }) {
  const isDirect = isDirectVideo(url);

  const figureProps = {
    className: [
      "wp-block-video",
      "video-lightbox",
      isDirect ? "video-autoplay" : "",
    ]
      .filter(Boolean)
      .join(" "),
    "data-fancybox": "",
    "data-src": url,
    "data-lightbox": "",
    ...(isDirect ? { "data-play-mode": playMode } : { "data-type": "iframe" }),
  };

  return (
    <figure {...figureProps}>
      <img className="video-poster" src={poster} alt="" />
      {isDirect && (
        <video className="video-content" muted loop playsInline>
          <source data-src={url} type={getVideoMimeType(url)} />
        </video>
      )}
    </figure>
  );
}

registerBlockType(metadata.name, {
  ...metadata,

  edit: function ({ attributes, setAttributes }) {
    const { id, url, poster, playMode } = attributes;
    const blockProps = useBlockProps();
    const hasVideo = Boolean(url);

    return (
      <>
        <EditorTools id={id} setAttributes={setAttributes} />
        <InspectorTools attributes={attributes} setAttributes={setAttributes} />
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
          {hasVideo && (
            <VideoFigure url={url} poster={poster} playMode={playMode} />
          )}
        </div>
      </>
    );
  },

  save: () => null,
});

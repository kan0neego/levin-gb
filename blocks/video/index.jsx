import {
  InspectorControls,
  MediaPlaceholder,
  MediaUpload,
  MediaUploadCheck,
  RichText,
  useBlockProps,
} from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import {
  Button,
  Dropdown,
  PanelBody,
  TextControl,
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { image, link } from "@wordpress/icons";
import { useState } from "@wordpress/element";
import { BlockSetupPanel } from "@/components/block-setup-panel";
import { MediaPreviewControl } from "@/components/media-preview-control";
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

/** MIME-тип по умолчанию для видео с неизвестным расширением. */
const DEFAULT_VIDEO_MIME_TYPE = "video/mp4";

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

  return VIDEO_MIME_TYPES[extension] ?? DEFAULT_VIDEO_MIME_TYPE;
}

const PLAY_MODES = [
  { label: "Авто-плей", value: "autoplay" },
  { label: "При наведении", value: "hover" },
];

/**
 * Извлекает из объекта вложения (выбор из медиабиблиотеки или REST-ответ)
 * значения атрибутов `id`, `url` и `mimeType` блока `theme/video`.
 *
 * Предпочитает `mime` вложения, чтобы не определять тип повторно при рендере.
 *
 * @param {Object} media Объект вложения.
 * @return {{id: number, url: string, mimeType: string}} Значения атрибутов.
 */
function createVideoAttributes(media) {
  const url = media?.url ?? "";

  return {
    id: media?.id ?? 0,
    url,
    mimeType: media?.mime || getVideoMimeType(url),
  };
}

/**
 * Панель выбора видео в сайдбаре.
 *
 * Кнопка «Редактировать превью» открывает попап изменения атрибута `preview`
 * (ссылка инлайнового тега video): выбор из медиагалереи либо ввод внешней
 * ссылки. Кнопка внешнего источника задаёт ссылку основного видео `url`.
 * Кнопка «Заменить постер» третьей открывает медиагалерею для атрибутов
 * `posterId`/`poster`.
 *
 * Выбор из галереи сохраняет `previewId` и `preview`; внешняя ссылка сбрасывает
 * `previewId` и определяет MIME-тип по расширению.
 *
 * @param {Object}   props
 * @param {number}   props.previewId     - ID текущего вложения превью.
 * @param {string}   props.preview       - URL текущего превью.
 * @param {string}   props.url           - URL основного видео.
 * @param {number}   props.posterId      - ID текущего вложения постера.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @return {import("react").JSX.Element}
 */
function VideoSourceControl({
  previewId,
  preview,
  url,
  posterId,
  setAttributes,
}) {
  const [externalUrl, setExternalUrl] = useState(preview);
  const [videoUrl, setVideoUrl] = useState(url);

  const selectPreview = (media) => {
    const nextUrl = media?.url ?? "";

    setAttributes({
      previewId: media?.id ?? 0,
      preview: nextUrl,
      mimeType: media?.mime || getVideoMimeType(nextUrl),
    });
    setExternalUrl(nextUrl);
  };

  const applyPreviewUrl = () => {
    setAttributes({
      previewId: 0,
      preview: externalUrl,
      mimeType: getVideoMimeType(externalUrl),
    });
  };

  const applyVideoUrl = () => {
    setAttributes({
      id: 0,
      url: videoUrl,
    });
  };

  return (
    <div className="video-source">
      <Dropdown
        className="video-source__dropdown"
        contentClassName="video-source__popover"
        popoverProps={{ placement: "bottom-start", resize: false }}
        renderToggle={({ isOpen, onToggle }) => (
          <Button
            variant="secondary"
            icon="video-alt3"
            label="Редактировать превью"
            onClick={onToggle}
            aria-expanded={isOpen}
          >
            Ред. превью
          </Button>
        )}
        renderContent={() => (
          <div className="video-source__popover-inner">
            <MediaUploadCheck>
              <MediaUpload
                value={previewId}
                allowedTypes={["video"]}
                render={({ open }) => (
                  <Button variant="secondary" onClick={open}>
                    Выбрать из медиагалереи
                  </Button>
                )}
                onSelect={selectPreview}
              />
            </MediaUploadCheck>
            <TextControl
              label="Ссылка на превью"
              value={externalUrl}
              placeholder="https://"
              onChange={setExternalUrl}
            />
            <Button variant="primary" onClick={applyPreviewUrl}>
              Применить
            </Button>
          </div>
        )}
      />
      <Dropdown
        className="video-source__dropdown"
        contentClassName="video-source__popover"
        popoverProps={{ placement: "bottom-start", resize: false }}
        renderToggle={({ isOpen, onToggle }) => (
          <Button
            className="video-source__button"
            variant="secondary"
            icon={link}
            label="Внешний источник"
            onClick={onToggle}
            aria-expanded={isOpen}
          />
        )}
        renderContent={() => (
          <div className="video-source__popover-inner">
            <TextControl
              label="Ссылка на видео"
              value={videoUrl}
              placeholder="https://"
              onChange={setVideoUrl}
            />
            <Button variant="primary" onClick={applyVideoUrl}>
              Применить
            </Button>
          </div>
        )}
      />
      <MediaUploadCheck>
        <MediaUpload
          value={posterId}
          allowedTypes={["image"]}
          render={({ open }) => (
            <Button
              className="video-source__button"
              variant="secondary"
              icon={image}
              label="Заменить постер"
              onClick={open}
            />
          )}
          onSelect={(media) =>
            setAttributes({
              posterId: media?.id ?? 0,
              poster: media?.url ?? "",
            })
          }
        />
      </MediaUploadCheck>
    </div>
  );
}

/**
 * Настройки блока в сайдбаре: видео, режим воспроизведения и постер.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @return {import("react").JSX.Element}
 */
function InspectorTools({ attributes, setAttributes }) {
  const { previewId, preview, url, playMode, posterId } = attributes;
  const hasVideo = Boolean(url);

  if (!hasVideo) return null;

  const isDirect = isDirectVideo(url);

  return (
    <InspectorControls>
      <PanelBody title="Настройка видео">
        <VideoSourceControl
          previewId={previewId}
          preview={preview}
          url={url}
          posterId={posterId}
          setAttributes={setAttributes}
        />
      </PanelBody>
      <PanelBody title="Настройки отображения">
        <ToggleGroupControl
          isBlock
          label="Режим воспроизведения"
          value={playMode}
          disabled={!isDirect}
          onChange={(value) => setAttributes({ playMode: value })}
        >
          {PLAY_MODES.map((mode) => (
            <ToggleGroupControlOption
              key={mode.value}
              value={mode.value}
              label={mode.label}
            />
          ))}
        </ToggleGroupControl>
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
 * @param {Object}   props
 * @param {string}   props.url        - URL выбранного видео.
 * @param {string}   props.preview    - URL инлайнового превью-видео.
 * @param {string}   props.mimeType   - MIME-тип видео из атрибутов блока.
 * @param {string}   props.poster     - URL постера.
 * @param {string}   props.playMode   - Режим воспроизведения.
 * @param {string}   props.caption    - Подпись к видео.
 * @param {Function} props.setCaption - setter атрибута caption.
 * @return {import("react").JSX.Element}
 */
function VideoFigure({
  url,
  preview,
  caption,
  mimeType,
  poster,
  playMode,
  setCaption,
}) {
  const isDirect = isDirectVideo(url);
  const previewUrl = preview;
  const sourceType = mimeType || getVideoMimeType(previewUrl);

  const figureProps = {
    className: [
      "vid-block",
      "wp-block-video",
      "video-lightbox",
      isDirect ? "video-autoplay" : "",
    ]
      .filter(Boolean)
      .join(" "),
    "data-src": url,
    "data-fancybox": "",
    ...(isDirect ? { "data-play-mode": playMode } : { "data-type": "iframe" }),
  };

  return (
    <figure {...figureProps}>
      <img className="video-poster" src={poster} alt="" />
      {isDirect && (
        <video className="video-content" muted loop playsInline>
          <source data-src={previewUrl} type={sourceType} />
        </video>
      )}
      <RichText
        tagName="figcaption"
        className="video-caption"
        value={caption}
        placeholder="Описание (опционально)"
        onChange={setCaption}
      />
    </figure>
  );
}

registerBlockType(metadata.name, {
  ...metadata,

  edit: function ({ attributes, setAttributes }) {
    const { url, preview, mimeType, poster, posterId, playMode, caption } =
      attributes;
    const blockProps = useBlockProps();
    const hasVideo = Boolean(url);

    return (
      <>
        <InspectorTools attributes={attributes} setAttributes={setAttributes} />
        <div {...blockProps}>
          {!hasVideo && (
            <BlockSetupPanel
              title={metadata.title}
              icon="video-alt3"
              hint="Выберите видео и обложку, затем настройте отображение."
            >
              <MediaPreviewControl
                label="Обложка"
                accept="image/*"
                allowedTypes={["image"]}
                value={{ id: posterId, url: poster }}
                onChange={(media) =>
                  setAttributes({
                    posterId: media?.id ?? 0,
                    poster: media?.url ?? "",
                  })
                }
              />
              <MediaPlaceholder
                icon="video-alt3"
                labels={{ title: "Видео" }}
                accept="video/*"
                allowedTypes={["video"]}
                onSelect={(media) =>
                  setAttributes(createVideoAttributes(media))
                }
                onSelectURL={(nextUrl) =>
                  setAttributes({
                    id: 0,
                    url: nextUrl,
                    mimeType: getVideoMimeType(nextUrl),
                  })
                }
              />
            </BlockSetupPanel>
          )}
          {hasVideo && (
            <VideoFigure
              url={url}
              preview={preview}
              caption={caption}
              mimeType={mimeType}
              poster={poster}
              playMode={playMode}
              setCaption={(value) => setAttributes({ caption: value })}
            />
          )}
        </div>
      </>
    );
  },

  save: () => null,
});

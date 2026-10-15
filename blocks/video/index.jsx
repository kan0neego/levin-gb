import {
  InspectorControls,
  MediaPlaceholder,
  RichText,
  useBlockProps,
} from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { dispatch } from "@wordpress/data";
import { PanelBody, Spinner } from "@wordpress/components";
import { useEffect, useRef, useState } from "@wordpress/element";
import bindVideoProgress from "@lib/video-progress";
import {
  BlockSetupPanel,
  BlockSetupSection,
} from "@/components/block-setup-panel";
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

const EMPTY_COVER = {
  posterId: 0,
  poster: "",
};

const EMPTY_FRAME = {
  id: 0,
  url: "",
};

const EMPTY_PREVIEW = {
  previewId: 0,
  preview: "",
  mimeType: "",
  width: 0,
  height: 0,
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

  return VIDEO_MIME_TYPES[extension] ?? DEFAULT_VIDEO_MIME_TYPE;
}

/**
 * Проверяет, что вложение уже загружено в медиабиблиотеку. Во время загрузки
 * `mediaUpload` сначала отдаёт временный объект с `blob:` ссылкой и без `id`.
 *
 * @param {Object} media Объект вложения.
 * @return {boolean} true — вложение загружено и имеет постоянную ссылку.
 */
function isUploadedMedia(media) {
  return Boolean(media?.id) && !(media.url ?? "").startsWith("blob:");
}

/**
 * Извлекает размеры видео из объекта вложения: выбор из медиабиблиотеки
 * отдаёт `width`/`height`, REST-ответ — `media_details`.
 *
 * @param {Object} media Объект вложения.
 * @return {{width: number, height: number}} Размеры видео либо нули.
 */
function getVideoDimensions(media) {
  return {
    width: media?.width ?? media?.media_details?.width ?? 0,
    height: media?.height ?? media?.media_details?.height ?? 0,
  };
}

/**
 * Есть ли непустой текст подписи (без учёта пустой HTML-разметки).
 *
 * @param {string} caption HTML подписи.
 * @return {boolean}
 */
function hasCaptionText(caption) {
  return Boolean((caption ?? "").replace(/<[^>]+>/g, "").trim());
}

/**
 * Начальная панель скрывается, когда задана обязательная обложка
 * и хотя бы один источник видео (фон или полный фрейм).
 *
 * @param {Object} attributes Атрибуты блока.
 * @return {boolean}
 */
function isVideoSetupComplete(attributes) {
  return (
    Boolean(attributes.poster) &&
    Boolean(attributes.url || attributes.preview)
  );
}

/**
 * Фоновое видео: только превью без фрейма, либо устаревший флаг
 * `isBackground` с источником в `url`.
 *
 * @param {Object} attributes Атрибуты блока.
 * @return {boolean}
 */
function isBackgroundVideo(attributes) {
  if (attributes.url) {
    return Boolean(attributes.isBackground) && !attributes.preview;
  }

  return Boolean(attributes.preview);
}

/**
 * Контролы обложки, фонового видео и полного фрейма.
 * Обложка независима. Превью пишет `previewId`/`preview`, фрейм — `id`/`url`.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @param {Function} [props.onUploadError] - Обработчик ошибки загрузки.
 * @param {boolean}  [props.isUploading] - Идёт загрузка вложения.
 * @param {Function} [props.setIsUploading] - setter состояния загрузки.
 * @return {{cover: import("react").JSX.Element, background: import("react").JSX.Element, frame: import("react").JSX.Element}}
 */
function getVideoModeControls({
  attributes,
  setAttributes,
  onUploadError,
  isUploading,
  setIsUploading,
}) {
  const { posterId, poster, id, url, previewId, preview } = attributes;
  const backgroundValue = { id: previewId, url: preview };
  const frameValue = { id, url };

  const selectCover = (media) => {
    if (!media?.url) {
      setAttributes({ ...EMPTY_COVER });
      return;
    }

    setAttributes({
      posterId: media.id ?? 0,
      poster: media.url,
    });
  };

  const selectBackground = (media) => {
    if (setIsUploading && media && !isUploadedMedia(media)) {
      setIsUploading(true);
      return;
    }

    if (setIsUploading) {
      setIsUploading(false);
    }

    if (!media?.url) {
      setAttributes({ ...EMPTY_PREVIEW });
      return;
    }

    const previewUrl = media.url;

    setAttributes({
      previewId: media.id ?? 0,
      preview: previewUrl,
      mimeType: media.mime || getVideoMimeType(previewUrl),
      ...getVideoDimensions(media),
    });
  };

  const selectFrame = (media) => {
    if (setIsUploading && media && !isUploadedMedia(media)) {
      setIsUploading(true);
      return;
    }

    if (setIsUploading) {
      setIsUploading(false);
    }

    if (!media?.url) {
      setAttributes({ ...EMPTY_FRAME, isBackground: false });
      return;
    }

    setAttributes({
      id: media.id ?? 0,
      url: media.url,
      isBackground: false,
    });
  };

  const selectFrameUrl = (nextUrl) => {
    setAttributes({
      ...EMPTY_FRAME,
      url: nextUrl,
      isBackground: false,
    });
  };

  return {
    cover: (
      <MediaPreviewControl
        label="Изображение (постер)"
        accept="image/*"
        allowedTypes={["image"]}
        value={{ id: posterId, url: poster }}
        onChange={selectCover}
        onDelete={() => selectCover()}
      />
    ),
    background: (
      <MediaPreviewControl
        label="Видеопревью"
        icon="video-alt3"
        accept="video/*"
        allowedTypes={["video"]}
        value={backgroundValue}
        onChange={selectBackground}
        onDelete={() => selectBackground()}
        renderPlaceholder={({
          icon,
          label,
          accept,
          allowedTypes,
          onSelect,
        }) => (
          <MediaPlaceholder
            icon={icon}
            labels={{ title: label }}
            accept={accept}
            allowedTypes={allowedTypes}
            onSelect={onSelect}
            onError={onUploadError}
          >
            {isUploading && <Spinner />}
          </MediaPlaceholder>
        )}
      />
    ),
    frame: (
      <MediaPreviewControl
        label="Внешний источник или медиа"
        icon="video-alt3"
        accept="video/*"
        allowedTypes={["video"]}
        value={frameValue}
        onChange={selectFrame}
        onDelete={() => selectFrame()}
        onSelectURL={selectFrameUrl}
        renderPlaceholder={({
          icon,
          label,
          accept,
          allowedTypes,
          onSelect,
          onSelectURL,
        }) => (
          <MediaPlaceholder
            icon={icon}
            labels={{ title: label }}
            accept={accept}
            allowedTypes={allowedTypes}
            onSelect={onSelect}
            onSelectURL={onSelectURL}
            onError={onUploadError}
          >
            {isUploading && <Spinner />}
          </MediaPlaceholder>
        )}
      />
    ),
  };
}

/**
 * Настройки блока в сайдбаре: обложка, фоновое видео и полный фрейм.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @return {import("react").JSX.Element}
 */
function InspectorTools({ attributes, setAttributes }) {
  const controls = getVideoModeControls({ attributes, setAttributes });

  return (
    <InspectorControls>
      <PanelBody title="Обложка">{controls.cover}</PanelBody>
      <PanelBody title="Фоновое видео">{controls.background}</PanelBody>
      <PanelBody title="Полное видео (Фрейм)">{controls.frame}</PanelBody>
    </InspectorControls>
  );
}

/**
 * Фоновое видео в редакторе: повторяет разметку render.php. Видео
 * воспроизводится сразу, без обложки и lightbox проигрывателя.
 *
 * Атрибуты `width`/`height` задают пропорции до загрузки видео. Если размеры
 * неизвестны (внешняя ссылка), они берутся из метаданных загруженного видео.
 *
 * @param {Object}   props
 * @param {string}   props.url           - URL видеофайла.
 * @param {number}   props.width         - Ширина видео.
 * @param {number}   props.height        - Высота видео.
 * @param {string}   props.caption       - Подпись к видео.
 * @param {Function} props.setCaption    - setter атрибута caption.
 * @param {Function} props.setDimensions - setter атрибутов width и height.
 * @return {import("react").JSX.Element}
 */
function BackgroundVideoFigure({
  url,
  width,
  height,
  caption,
  setCaption,
  setDimensions,
}) {
  const hasDimensions = width > 0 && height > 0;
  const figureRef = useRef(null);

  useEffect(() => {
    if (!figureRef.current) {
      return undefined;
    }

    return bindVideoProgress(figureRef.current);
  }, [url]);

  const onLoadedMetadata = (event) => {
    const { videoWidth, videoHeight } = event.currentTarget;
    if (hasDimensions || !videoWidth || !videoHeight) return;
    setDimensions({ width: videoWidth, height: videoHeight });
  };

  return (
    <figure
      ref={figureRef}
      className={[
        "vid-block",
        "wp-block-video",
        "video-background",
        hasCaptionText(caption) ? "has-caption" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <video
        className="video-content"
        src={url}
        width={hasDimensions ? width : undefined}
        height={hasDimensions ? height : undefined}
        style={
          hasDimensions ? { aspectRatio: `${width} / ${height}` } : undefined
        }
        autoPlay
        muted
        loop
        playsInline
        onLoadedMetadata={onLoadedMetadata}
      />
      <div className="video-progress" aria-hidden="true">
        <div className="video-progress__bar" />
      </div>
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
      previewUrl ? "video-autoplay" : "",
      hasCaptionText(caption) ? "has-caption" : "",
    ]
      .filter(Boolean)
      .join(" "),
    "data-src": url,
    "data-fancybox": "",
    ...(isDirect ? { "data-play-mode": playMode } : { "data-type": "iframe" }),
  };

  return (
    <figure {...figureProps}>
      {poster && <img className="video-poster" src={poster} alt="" />}
      {previewUrl && (
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
    const {
      url,
      preview,
      mimeType,
      poster,
      playMode,
      caption,
      width,
      height,
    } = attributes;
    const blockProps = useBlockProps();
    const [isUploading, setIsUploading] = useState(false);
    const isSetupComplete = isVideoSetupComplete(attributes);
    const isBackgroundMode = isBackgroundVideo(attributes);

    const onUploadError = (error) => {
      setIsUploading(false);
      const message =
        (typeof error === "string" ? error : error?.message) ||
        "Не удалось загрузить видео.";
      dispatch("core/notices").createErrorNotice(message, {
        type: "snackbar",
        isDismissible: true,
      });
    };

    const controls = getVideoModeControls({
      attributes,
      setAttributes,
      onUploadError,
      isUploading,
      setIsUploading,
    });

    const setCaption = (value) => setAttributes({ caption: value });

    return (
      <>
        {isSetupComplete && (
          <InspectorTools
            attributes={attributes}
            setAttributes={setAttributes}
          />
        )}
        <div {...blockProps}>
          {!isSetupComplete && (
            <BlockSetupPanel
              title={metadata.title}
              icon="video-alt3"
              hint="Обложка обязательна. Добавьте фоновое или полное видео."
            >
              <BlockSetupSection title="Обложка">
                {controls.cover}
              </BlockSetupSection>
              <BlockSetupSection title="Фоновое видео">
                {controls.background}
              </BlockSetupSection>
              <BlockSetupSection title="Полное видео (Фрейм)">
                {controls.frame}
              </BlockSetupSection>
            </BlockSetupPanel>
          )}
          {isSetupComplete && isBackgroundMode && (
            <BackgroundVideoFigure
              url={preview || url}
              width={width}
              height={height}
              caption={caption}
              setCaption={setCaption}
              setDimensions={setAttributes}
            />
          )}
          {isSetupComplete && !isBackgroundMode && (
            <VideoFigure
              url={url}
              preview={preview}
              caption={caption}
              mimeType={mimeType}
              poster={poster}
              playMode={playMode}
              setCaption={setCaption}
            />
          )}
        </div>
      </>
    );
  },

  save: () => null,
});

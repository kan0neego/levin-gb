import {
  InspectorControls,
  MediaPlaceholder,
  MediaUpload,
  MediaUploadCheck,
  RichText,
  useBlockProps,
} from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { dispatch } from "@wordpress/data";
import {
  Button,
  Dropdown,
  PanelBody,
  Spinner,
  TextControl,
  ToggleControl,
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
  { label: "Автоплей", value: "autoplay" },
  { label: "Наведениe", value: "hover" },
];

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
 * Извлекает из объекта вложения (выбор из медиабиблиотеки или REST-ответ)
 * значения атрибутов `id`, `url`, `mimeType`, `width` и `height` блока
 * `theme/video`.
 *
 * Предпочитает `mime` вложения, чтобы не определять тип повторно при рендере.
 *
 * @param {Object} media Объект вложения.
 * @return {{id: number, url: string, mimeType: string, width: number, height: number}} Значения атрибутов.
 */
function createVideoAttributes(media) {
  const url = media?.url ?? "";

  return {
    id: media?.id ?? 0,
    url,
    mimeType: media?.mime || getVideoMimeType(url),
    ...getVideoDimensions(media),
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
 * Фоновое видео не использует превью и постер, поэтому их кнопки скрыты.
 *
 * @param {Object}   props
 * @param {number}   props.previewId     - ID текущего вложения превью.
 * @param {string}   props.preview       - URL текущего превью.
 * @param {string}   props.url           - URL основного видео.
 * @param {number}   props.posterId      - ID текущего вложения постера.
 * @param {boolean}  props.isBackground  - Включён режим фонового видео.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @return {import("react").JSX.Element}
 */
function VideoSourceControl({
  previewId,
  preview,
  url,
  posterId,
  isBackground,
  setAttributes,
}) {
  const [externalUrl, setExternalUrl] = useState(preview);
  const [videoUrl, setVideoUrl] = useState(url);

  const getMedia = (media) => {
    const { id, url, mime } = media;
    return { id, url, mime: mime || getVideoMimeType(url) };
  };

  const selectPreview = (media) => {
    const { id, url, mime } = getMedia(media);

    setAttributes({ previewId: id, preview: url, mimeType: mime });
    setExternalUrl(url);
  };

  const selectVideo = (media) => {
    const { id, url } = getMedia(media);
    setAttributes({ id, url, ...getVideoDimensions(media) });
    setVideoUrl(url);
  };

  const applyPreviewUrl = () => {
    if (externalUrl === preview) return;
    const mime = getVideoMimeType(externalUrl);
    setAttributes({ id: 0, preview: externalUrl, mime });
  };

  const applyVideoUrl = () => {
    if (videoUrl === url) return;
    setAttributes({ id: 0, url: videoUrl, width: 0, height: 0 });
  };

  return (
    <div className="video-source">
      {!isBackground && (
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
          renderContent={({ onClose }) => (
            <div className="video-source__popover-inner">
              <MediaUploadCheck>
                <MediaUpload
                  value={previewId}
                  allowedTypes={["video"]}
                  render={({ open }) => (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onClose();
                        setTimeout(() => open(), 150);
                      }}
                    >
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
              <Button
                variant="primary"
                onClick={() => {
                  applyPreviewUrl();
                  onClose();
                }}
              >
                Применить
              </Button>
            </div>
          )}
        />
      )}
      <Dropdown
        className="video-source__dropdown"
        contentClassName="video-source__popover"
        popoverProps={{ placement: "bottom-start", resize: false }}
        renderToggle={({ isOpen, onToggle }) => (
          <Button
            className="video-source__button"
            variant="secondary"
            icon={link}
            label="Внешний источник или медиа"
            onClick={onToggle}
            aria-expanded={isOpen}
          />
        )}
        renderContent={({ onClose }) => (
          <div className="video-source__popover-inner">
            <MediaUploadCheck>
              <MediaUpload
                value={url}
                allowedTypes={["video"]}
                render={({ open }) => (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onClose();
                      setTimeout(() => open(), 150);
                    }}
                  >
                    Выбрать из медиагалереи
                  </Button>
                )}
                onSelect={selectVideo}
              />
            </MediaUploadCheck>
            <TextControl
              label="Ссылка на видео"
              value={videoUrl}
              placeholder="https://"
              onChange={setVideoUrl}
            />
            <Button
              variant="primary"
              onClick={() => {
                applyVideoUrl();
                onClose();
              }}
            >
              Применить
            </Button>
          </div>
        )}
      />
      {!isBackground && (
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
      )}
    </div>
  );
}

/**
 * Настройки блока в сайдбаре: видео, режим отображения, режим
 * воспроизведения и постер.
 *
 * Фоновый режим доступен только для прямой ссылки на видеофайл.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @return {import("react").JSX.Element}
 */
function InspectorTools({ attributes, setAttributes }) {
  const { previewId, preview, url, playMode, posterId, isBackground } =
    attributes;
  const hasVideo = Boolean(url);

  if (!hasVideo) return null;
  const hasPreview = preview !== "";
  const isDirect = isDirectVideo(url);
  const showBackground = isBackground && isDirect;

  return (
    <InspectorControls>
      <PanelBody title="Настройка видео">
        <VideoSourceControl
          previewId={previewId}
          preview={preview}
          url={url}
          posterId={posterId}
          isBackground={showBackground}
          setAttributes={setAttributes}
        />
      </PanelBody>
      <PanelBody title="Настройки отображения">
        <ToggleControl
          label="Фоновое видео"
          help={isDirect && "Доступно только для прямой ссылки на видеофайл."}
          checked={showBackground}
          disabled={!isDirect}
          onChange={(value) => setAttributes({ isBackground: value })}
        />
        {!showBackground && (
          <ToggleGroupControl
            isBlock
            label="Режим воспроизведения"
            value={playMode}
            disabled={!hasPreview}
            onChange={(value) => setAttributes({ playMode: value })}
          >
            {PLAY_MODES.map((mode) => (
              <ToggleGroupControlOption
                key={mode.value}
                value={mode.value}
                label={mode.label}
                disabled={!hasPreview}
              />
            ))}
          </ToggleGroupControl>
        )}
      </PanelBody>
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

  const onLoadedMetadata = (event) => {
    const { videoWidth, videoHeight } = event.currentTarget;
    if (hasDimensions || !videoWidth || !videoHeight) return;
    setDimensions({ width: videoWidth, height: videoHeight });
  };

  return (
    <figure className="vid-block wp-block-video video-background">
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
      {poster && <img className="video-poster" src={poster} alt="" />}
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
    const {
      url,
      preview,
      mimeType,
      poster,
      posterId,
      playMode,
      caption,
      isBackground,
      width,
      height,
    } = attributes;
    const blockProps = useBlockProps();
    const [isUploading, setIsUploading] = useState(false);

    const hasVideo = Boolean(url);
    const isDirect = isDirectVideo(url);
    const hasPoster = Boolean(poster);
    const showBackground = isBackground && isDirect;
    const showSetup = !hasVideo || (!showBackground && !hasPoster);

    const setCaption = (value) => setAttributes({ caption: value });

    const selectVideo = (media) => {
      if (!isUploadedMedia(media)) return setIsUploading(true);
      setIsUploading(false);
      setAttributes(createVideoAttributes(media));
    };

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

    return (
      <>
        <InspectorTools attributes={attributes} setAttributes={setAttributes} />
        <div {...blockProps}>
          {showSetup && (
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
                value={hasVideo ? { id: attributes.id, src: url } : undefined}
                onSelect={selectVideo}
                onError={onUploadError}
                onSelectURL={(nextUrl) =>
                  setAttributes({
                    id: 0,
                    url: nextUrl,
                    mimeType: getVideoMimeType(nextUrl),
                    width: 0,
                    height: 0,
                  })
                }
              >
                {isUploading && <Spinner />}
              </MediaPlaceholder>
              <ToggleControl
                label="Фоновое видео"
                help={
                  hasVideo &&
                  !isDirect &&
                  "Доступно только для прямой ссылки на видеофайл."
                }
                checked={isBackground}
                disabled={hasVideo && !isDirect}
                onChange={(value) => setAttributes({ isBackground: value })}
              />
            </BlockSetupPanel>
          )}
          {hasVideo && showBackground && (
            <BackgroundVideoFigure
              url={url}
              width={width}
              height={height}
              caption={caption}
              setCaption={setCaption}
              setDimensions={setAttributes}
            />
          )}
          {hasVideo && !showBackground && hasPoster && (
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

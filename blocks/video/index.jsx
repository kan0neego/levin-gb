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
  SelectControl,
  TextControl,
} from "@wordpress/components";
import { link } from "@wordpress/icons";
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
  { label: "Автовоспроизведение", value: "autoplay" },
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
 * Панель выбора видео в сайдбаре: кнопка выбора из медиагалереи и кнопка
 * внешнего источника, открывающая попап с полем ввода ссылки.
 *
 * Выбор из галереи сохраняет `id`, `url` и MIME-тип вложения; внешняя ссылка
 * сбрасывает `id` и определяет MIME-тип по расширению.
 *
 * @param {Object}   props
 * @param {number}   props.id            - ID текущего вложения.
 * @param {string}   props.url           - URL текущего видео.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @return {import("react").JSX.Element}
 */
function VideoSourceControl({ id, url, setAttributes }) {
  const [externalUrl, setExternalUrl] = useState(url);

  const applyExternalUrl = () => {
    setAttributes({
      id: 0,
      url: externalUrl,
      mimeType: getVideoMimeType(externalUrl),
    });
  };

  return (
    <div className="video-source">
      <MediaUploadCheck>
        <MediaUpload
          value={id}
          allowedTypes={["video"]}
          render={({ open }) => (
            <Button
              variant="secondary"
              icon="video-alt3"
              label="Изменить видео"
              onClick={open}
            >
              Изменить видео
            </Button>
          )}
          onSelect={(media) => {
            setAttributes(createVideoAttributes(media));
            setExternalUrl(media?.url ?? "");
          }}
        />
      </MediaUploadCheck>
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
              value={externalUrl}
              placeholder="https://"
              onChange={setExternalUrl}
            />
            <Button variant="primary" onClick={applyExternalUrl}>
              Применить
            </Button>
          </div>
        )}
      />
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
  const { id, url, playMode, posterId } = attributes;
  const hasVideo = Boolean(url);

  if (!hasVideo) return null;

  const isDirect = isDirectVideo(url);

  return (
    <InspectorControls>
      <PanelBody title="Настройка видео">
        <VideoSourceControl id={id} url={url} setAttributes={setAttributes} />
      </PanelBody>
      <PanelBody title="Настройки отображения">
        <SelectControl
          label="Режим воспроизведения"
          value={playMode}
          options={PLAY_MODES}
          disabled={!isDirect}
          onChange={(value) => setAttributes({ playMode: value })}
        />
        <MediaUploadCheck>
          <MediaUpload
            value={posterId}
            allowedTypes={["image"]}
            render={({ open }) => (
              <Button variant="secondary" onClick={open}>
                Заменить постер
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
 * @param {Object}   props
 * @param {string}   props.url        - URL выбранного видео.
 * @param {string}   props.mimeType   - MIME-тип видео из атрибутов блока.
 * @param {string}   props.poster     - URL постера.
 * @param {string}   props.playMode   - Режим воспроизведения.
 * @param {string}   props.caption    - Подпись к видео.
 * @param {Function} props.setCaption - setter атрибута caption.
 * @return {import("react").JSX.Element}
 */
function VideoFigure({ url, caption, mimeType, poster, playMode, setCaption }) {
  const isDirect = isDirectVideo(url);
  // Атрибут хранит тип, определённый при выборе; парсим только как fallback.
  const sourceType = mimeType || getVideoMimeType(url);

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
          <source data-src={url} type={sourceType} />
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
    const { url, mimeType, poster, posterId, playMode, caption } = attributes;
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

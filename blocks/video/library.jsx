import { PanelBody, Spinner } from "@wordpress/components";
import { dispatch } from "@wordpress/data";
import { useEffect, useRef, useState } from "@wordpress/element";
import { BlockSetupSection } from "@/components/block-setup-panel";
import { PostRelationControl } from "@/components/post-relation-control";
import { EMPTY_VIDEO_MEDIA } from "@/components/video";
import { loadVideoSource } from "./source";
import { fillVideoIdMedia, needsVideoIdMedia } from "./video-id-media";

/**
 * Выбор записи CPT `videos`. Снимок меты пишется одним setAttributes:
 * videoId и doctorIds — обёртка, превью — из записи.
 * Обложка и ссылка пишутся только если в блоке они ещё пустые.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter всех атрибутов блока.
 * @return {import("react").JSX.Element}
 */
export function VideoLibraryControl({ attributes, setAttributes }) {
  const videoId = attributes.videoId || 0;
  const [isLoading, setIsLoading] = useState(false);
  const requestRef = useRef(0);
  const attributesRef = useRef(attributes);
  const value = videoId ? [{ videoId }] : [];

  attributesRef.current = attributes;

  const applySelection = (next) => {
    const nextId = Number(next[0]?.videoId) || 0;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    if (!nextId) {
      setIsLoading(false);
      setAttributes({
        videoId: 0,
        doctorIds: [],
        ...EMPTY_VIDEO_MEDIA,
      });
      return;
    }

    setIsLoading(true);
    loadVideoSource(nextId)
      .then((patch) => {
        if (requestRef.current !== requestId) {
          return;
        }

        const filled = fillVideoIdMedia(
          { ...attributesRef.current, videoId: nextId },
          patch,
        );

        setAttributes({
          ...patch,
          videoId: nextId,
          posterId: filled.posterId,
          poster: filled.poster,
          id: filled.id,
          url: filled.url,
        });
      })
      .catch((error) => {
        if (requestRef.current !== requestId) {
          return;
        }

        const message =
          (typeof error === "string" ? error : error?.message) ||
          "Не удалось загрузить данные видео.";
        dispatch("core/notices").createErrorNotice(message, {
          type: "snackbar",
          isDismissible: true,
        });
      })
      .finally(() => {
        if (requestRef.current === requestId) {
          setIsLoading(false);
        }
      });
  };

  return (
    <>
      <PostRelationControl
        value={value}
        onChange={applySelection}
        valueKey="videoId"
        postType="videos"
        taxonomy="video_types"
        selectionMode="single"
        maxItems={1}
        addLabel="Выбрать видео"
        selectedLabel="Видео"
        taxonomyLabel="Тип видео"
        emptyLabel="Видео не найдены"
        hint="Превью подставится из записи. Пустые обложка и ссылка — тоже."
      />
      {isLoading && <Spinner />}
    </>
  );
}

/**
 * Тот же выбор записи в панели настройки или в сайдбаре.
 *
 * @param {Object}   props
 * @param {string}   props.variant       - `setup` или `inspector`.
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter всех атрибутов блока.
 * @return {import("react").JSX.Element}
 */
export function VideoLibrarySlot({ variant, attributes, setAttributes }) {
  const control = (
    <VideoLibraryControl
      attributes={attributes}
      setAttributes={setAttributes}
    />
  );

  if (variant === "setup") {
    return (
      <BlockSetupSection title="Запись видео">{control}</BlockSetupSection>
    );
  }

  return (
    <PanelBody title="Запись видео" initialOpen>
      {control}
    </PanelBody>
  );
}

/**
 * Обложка, превью и ссылка из записи `videoId`, если в блоке эти поля пустые.
 * В атрибуты не пишется: непустые poster, preview и url остаются как есть,
 * пустые читаются заново при каждом показе.
 *
 * @param {Object} attributes Атрибуты блока.
 * @return {Object}
 */
export function useVideoIdMedia(attributes) {
  const videoId = needsVideoIdMedia(attributes)
    ? Number(attributes.videoId) || 0
    : 0;
  const [loaded, setLoaded] = useState({ videoId: 0, source: null });

  useEffect(() => {
    if (!videoId) {
      return undefined;
    }

    let active = true;

    loadVideoSource(videoId)
      .then((source) => {
        if (active) {
          setLoaded({ videoId, source });
        }
      })
      .catch(() => {
        if (active) {
          setLoaded({ videoId, source: null });
        }
      });

    return () => {
      active = false;
    };
  }, [videoId]);

  const source = loaded.videoId === videoId ? loaded.source : null;

  return fillVideoIdMedia(attributes, source);
}

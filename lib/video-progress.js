/**
 * Привязывает шкалу прогресса к воспроизведению фонового видео.
 *
 * @param {HTMLElement} container Корневой элемент `.video-background`.
 * @return {Function} Функция отписки от событий и анимации.
 */
export default function bindVideoProgress(container) {
  const video = container.querySelector("video");
  const bar = container.querySelector(".video-progress__bar");

  if (!video || !bar) {
    return () => {};
  }

  let frame = 0;

  const update = () => {
    const duration = video.duration;

    if (duration && !Number.isNaN(duration)) {
      bar.style.transform = `scaleX(${Math.min(video.currentTime / duration, 1)})`;
    }

    if (!video.paused && !video.ended) {
      frame = requestAnimationFrame(update);
    }
  };

  const start = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };

  const stop = () => {
    cancelAnimationFrame(frame);
  };

  video.addEventListener("play", start);
  video.addEventListener("pause", stop);
  video.addEventListener("seeked", update);
  video.addEventListener("loadedmetadata", update);

  if (!video.paused) {
    start();
  }

  return () => {
    stop();
    video.removeEventListener("play", start);
    video.removeEventListener("pause", stop);
    video.removeEventListener("seeked", update);
    video.removeEventListener("loadedmetadata", update);
  };
}

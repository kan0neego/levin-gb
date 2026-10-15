/**
 * Привязывает шкалу прогресса к воспроизведению фонового видео.
 *
 * @param {HTMLElement} container Корневой элемент `.video-autoplay`.
 * @return {Function} Функция отписки от событий и анимации.
 */
export default function bindVideoProgress(container) {
  const video = container.querySelector("video");
  const track = container.querySelector(".video-progress");

  if (!video || !track) {
    return () => {};
  }

  let frame = 0;

  const update = () => {
    const duration = video.duration;

    if (duration && !Number.isNaN(duration)) {
      track.style.setProperty(
        "--video-progress",
        String(Math.min(video.currentTime / duration, 1)),
      );
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

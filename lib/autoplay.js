import { animate } from 'motion';
import { getDeviceType } from './utils.js';

class Video {
  constructor(el) {
    this.video = el;
    this.source = el.querySelector('source');
  }

  async play() {
    await this.video.play();
    return this;
  }

  pause() {
    this.video.pause();
    this.video.currentTime = 0;

    return this;
  }

  preload() {
    const url = this.source.dataset.src;
    this.source.setAttribute('src', url);
    delete this.source.dataset.src;

    return this;
  }

  load() {
    this.video.load();

    return this;
  }

  reload() {
    this.video.load();

    return this;
  }
}

function videoPlay(container, element, mode) {
  const video = new Video(element);
  const poster = container.querySelector('.video-poster');
  const device = getDeviceType();
  const isMobile = device === 'mobile';

  if (isMobile) return;

  switch (mode) {
    case 'hover':
      container.addEventListener(
        'mouseover',
        () => {
          video.preload().load();
        },
        { once: true },
      );

      container.addEventListener('mouseover', () => {
        video.play().then(() => {
          animate(poster, { opacity: [1, 0] });
        });
      });

      container.addEventListener('mouseleave', () => {
        animate(poster, { opacity: [0, 1] }).then(() => {
          video.pause().reload();
        });
      });
      break;
    case 'autoplay':
      video
        .preload()
        .load()
        .play()
        .then(() => {
          animate(poster, { opacity: [1, 0] });
        });
      break;
  }
}

export default function module(container) {
  const video = container.querySelector('video');
  const mode = container.dataset?.playMode || 'autoplay';
  if (video) return videoPlay(container, video, mode);
}

import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import '@/styles/fancybox.scss';

export default function module() {
  Fancybox.bind('[data-fancybox]', {
    Thumbs: { type: 'modern', axis: 'y', autoStart: false },
  });
}

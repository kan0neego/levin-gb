import {
  isLegacyBackgroundVideo,
  migrateLegacyBackgroundVideo,
} from "@/lib/blocks/migrate-video-attributes";
import metadata from "./block.json";

/**
 * Старые посты хранят фоновое видео в `url` с `isBackground`.
 * save не менялся, поэтому миграция идёт через isEligible.
 */
export const deprecated = [
  {
    attributes: metadata.attributes,
    supports: metadata.supports,
    isEligible: isLegacyBackgroundVideo,
    migrate: migrateLegacyBackgroundVideo,
    save: () => null,
  },
];

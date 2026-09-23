import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";

/**
 * SSR-only блок theme/case-list для ServerSideRender из слайдера кейсов.
 *
 * Блок регистрируется на клиенте только для резолва имени и атрибута `caseId`
 * (это требуется компоненту ServerSideRender, который санитизирует атрибуты
 * через getBlockType()). Сам рендер карточки целиком выполняет render.php на
 * сервере, поэтому edit/save здесь — заглушки и в редакторе не используются.
 */
registerBlockType(metadata.name, {
	...metadata,

	edit: () => null,

	save: () => null,
});

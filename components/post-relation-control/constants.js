/**
 * Константы контрола выбора записей.
 */

/** Размер выборки результатов и запроса заголовков выбранных записей. */
export const DEFAULT_PER_PAGE = 100;

/** Размер выборки терминов таксономии для фильтра. */
export const TERMS_PER_PAGE = 100;

/**
 * Статусы записей: REST API без явного `status` отдаёт только `publish`,
 * поэтому черновик нужно запрашивать.
 * @see WP_REST_Posts_Controller::get_collection_params()
 */
export const POST_STATUSES = "publish,draft";

/** Статус черновика — для пометки в заголовке записи. */
export const DRAFT_STATUS = "draft";

/** Подписи, которые не меняются между блоками. */
export const MISSING_TITLE_LABEL = "(Запись недоступна или удалена)";
export const DRAFT_LABEL = "(Черновик)";
export const REMOVE_LABEL = "Убрать";
export const ALL_TERMS_LABEL = "Все";
export const EMPTY_SELECTED_LABEL = "Пока ничего не выбрано";

/** Задержка поиска перед отправкой запроса, мс. */
export const SEARCH_DELAY = 300;

/** Значение опции «все термины» в фильтре таксономии. */
export const ALL_TERMS = "";

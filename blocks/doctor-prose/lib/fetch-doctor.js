import apiFetch from "@wordpress/api-fetch";

/** Маршрут врача по id: `%d` заменяется на ID записи. */
const ROUTE = "/api/v1/doctors/%d";

/**
 * Полные данные одного врача из ACF (аватар и фото) для блока «Цитата врача».
 *
 * ACF-поля тип записи `doctors` не отдаются в стандартном REST-ответе, поэтому
 * данные приходят со специального серверного роута `api/v1/doctors/{id}`, который
 * отдаёт `{ id, name, spec, avatar, picture }`.
 *
 * @param {number|string} id ID записи типа `doctors`.
 * @returns {Promise<Object>} Полные данные врача.
 */
export function fetchDoctor(id) {
  return apiFetch({ path: ROUTE.replace("%d", id) });
}

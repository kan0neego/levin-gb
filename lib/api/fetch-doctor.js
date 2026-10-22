import apiFetch from "@wordpress/api-fetch";

/** Маршрут врача по id: `%d` заменяется на ID записи. */
const ROUTE = "/api/v1/doctors/%d";

/**
 * Живые данные врача для предпросмотра в редакторе.
 *
 * ACF-поля типа `doctors` не отдаются в стандартном REST-ответе, поэтому
 * данные приходят с `api/v1/doctors/{id}`. Результат нельзя сохранять в
 * атрибуты блока: поля врача меняются независимо от поста с блоком.
 *
 * @param {number|string} id ID записи типа `doctors`.
 * @return {Promise<Object>} Полные данные врача.
 */
export function fetchDoctor( id ) {
  return apiFetch( { path: ROUTE.replace( "%d", id ) } );
}

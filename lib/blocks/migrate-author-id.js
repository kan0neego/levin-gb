/**
 * Миграция атрибута `author` после отказа от снимка полей врача.
 * В посте остаётся только id; живые данные читаются с сущности.
 *
 * @param {Object} [attributes] Атрибуты блока из сохранённого контента.
 * @return {boolean} Есть ли в `author` поля кроме `id`.
 */
function hasSnapshotAuthorFields( attributes ) {
	const author = attributes?.author;

	if ( ! author || typeof author !== "object" || Array.isArray( author ) ) {
		return false;
	}

	return Object.keys( author ).some( ( key ) => key !== "id" );
}

/**
 * @param {Object} [attributes] Атрибуты блока из сохранённого контента.
 * @return {Object} Атрибуты с `author: { id }`.
 */
function migrateAuthorIdOnly( attributes ) {
	const id = attributes?.author?.id ?? "";

	return {
		...attributes,
		author: { id },
	};
}

module.exports = {
	__esModule: true,
	hasSnapshotAuthorFields,
	migrateAuthorIdOnly,
};

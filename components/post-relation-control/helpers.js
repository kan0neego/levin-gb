import { decodeEntities } from "@wordpress/html-entities";

import { DEFAULT_PER_PAGE } from "./constants";

/**
 * Приводит заголовок записи к строке без HTML-сущностей.
 *
 * В зависимости от контекста REST API `title` приходит либо объектом
 * `{ rendered }`, либо строкой.
 *
 * @param {Object} record Запись из REST API.
 * @returns {string} Заголовок записи.
 */
export function getRecordTitle(record) {
  const raw = record?.title?.rendered ?? record?.title ?? "";

  return decodeEntities(String(raw));
}

/**
 * Перемещает элемент массива на новую позицию.
 *
 * Чистая функция: возвращает `null`, если перестановка ничего не меняет,
 * чтобы вызывающий код не записывал значение в атрибут без необходимости.
 *
 * @param {Array}  items Элементы списка.
 * @param {number} from  Текущий индекс элемента.
 * @param {number} to    Новый индекс элемента.
 * @returns {Array|null} Новый массив или `null`, если порядок не изменился.
 */
export function moveItem(items, from, to) {
  if (from === to || to < 0 || to >= items.length) {
    return null;
  }

  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return next;
}

/**
 * Канонический ключ набора ID: сортировка делает ключ независимым от
 * порядка, поэтому перестановка элементов не инвалидирует запрос.
 *
 * @param {Array} ids Идентификаторы записей.
 * @returns {string} Ключ вида «1,2,3».
 */
export function toIdsKey(ids) {
  return [...ids].map(String).sort().join(",");
}

/**
 * Разбирает ключ набора ID обратно в массив.
 *
 * @param {string} key   Ключ, полученный из `toIdsKey`.
 * @param {number} limit Максимальная длина выборки (ограничение REST API).
 * @returns {Array} Числовые идентификаторы.
 */
export function fromIdsKey(key, limit = DEFAULT_PER_PAGE) {
  if (!key) {
    return [];
  }

  return key.split(",").map(Number).filter(Number.isFinite).slice(0, limit);
}

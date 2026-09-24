import { decodeEntities } from "@wordpress/html-entities";

import {
  DEFAULT_PER_PAGE,
  DRAFT_LABEL,
  DRAFT_STATUS,
  MISSING_TITLE_LABEL,
} from "./constants";

/**
 * Приводит заголовок записи к строке без HTML-сущностей.
 *
 * @param {Object} record Запись из REST API.
 * @returns {string} Заголовок записи.
 */
export function getRecordTitle(record) {
  const raw = record?.title?.rendered ?? record?.title ?? "";

  return decodeEntities(String(raw));
}

/**
 * Проверяет, что запись находится в черновике.
 *
 * @param {Object} record Запись из REST API.
 * @returns {boolean} `true`, если статус записи — `draft`.
 */
export function isDraftRecord(record) {
  return record?.status === DRAFT_STATUS;
}

/**
 * Подпись записи для списков выбора и выбранных.
 *
 * Порядок проверок важен: у отсутствующей записи нет ни заголовка, ни
 * статуса, поэтому она проверяется первой.
 *
 * @param {Object} record Запись из REST API или `undefined`.
 * @returns {string} Подпись для вывода.
 */
export function getRecordLabel(record) {
  if (!record) {
    return MISSING_TITLE_LABEL;
  }

  const title = getRecordTitle(record);

  if (isDraftRecord(record)) {
    return `${title || MISSING_TITLE_LABEL} ${DRAFT_LABEL}`;
  }

  return title;
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

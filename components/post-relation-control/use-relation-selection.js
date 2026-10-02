import { useCallback, useMemo } from "@wordpress/element";

import { moveItem } from "./helpers";

/**
 * Выбранные записи и операции над ними.
 *
 * Значение атрибута блока — упорядоченный массив `[{ [valueKey]: id }]`,
 * поэтому порядок элементов здесь сразу является порядком вывода на сайте.
 *
 * @param {Object}   options
 * @param {Array}    options.value     - Текущее значение атрибута.
 * @param {Function} options.onChange  - Получает новое значение.
 * @param {string}   options.valueKey  - Ключ ID внутри элемента массива.
 * @param {number}   options.maxItems  - Лимит выбранных записей (0 — нет).
 * @returns {Object} Список ID и обработчики изменения.
 */
export function useRelationSelection({ value, onChange, valueKey, maxItems }) {
  const selectedIds = useMemo(
    () =>
      value
        .map((item) => item?.[valueKey])
        .filter((id) => id !== undefined && id !== null),
    [value, valueKey],
  );

  // ID из REST и из атрибута могут отличаться типом, поэтому сравнение идёт
  // по строковому представлению.
  const selectedIdSet = useMemo(
    () => new Set(selectedIds.map(String)),
    [selectedIds],
  );

  const isSelected = useCallback(
    (id) => selectedIdSet.has(String(id)),
    [selectedIdSet],
  );

  const maxReached = maxItems > 0 && selectedIds.length >= maxItems;

  /**
   * Записывает новый порядок ID в атрибут блока, сохраняя исходные объекты
   * элементов, чтобы не потерять их дополнительные поля.
   *
   * @param {Array} nextIds Новый упорядоченный список ID.
   */
  const applyIds = useCallback(
    (nextIds) => {
      const existing = new Map(
        value.map((item) => [String(item?.[valueKey]), item]),
      );

      onChange(
        nextIds.map((id) => existing.get(String(id)) ?? { [valueKey]: id }),
      );
    },
    [onChange, value, valueKey],
  );

  const addId = useCallback(
    (id) => {
      if (isSelected(id) || maxReached) {
        return;
      }

      applyIds([...selectedIds, id]);
    },
    [applyIds, isSelected, maxReached, selectedIds],
  );

  const removeId = useCallback(
    (id) => {
      applyIds(selectedIds.filter((item) => String(item) !== String(id)));
    },
    [applyIds, selectedIds],
  );

  const toggleId = useCallback(
    (id, checked) => {
      if (checked) {
        addId(id);
      } else {
        removeId(id);
      }
    },
    [addId, removeId],
  );

  /**
   * Заменяет набор выбранных записей одиночной — для режима единичного
   * выбора. Если ID не изменился, атрибут не перезаписывается.
   *
   * @param {string|number} id ID записи.
   */
  const replaceId = useCallback(
    (id) => {
      if (String(id) === String(selectedIds[0])) {
        return;
      }

      applyIds([id]);
    },
    [applyIds, selectedIds],
  );

  const moveByIndex = useCallback(
    (from, to) => {
      const next = moveItem(selectedIds, from, to);

      if (next) {
        applyIds(next);
      }
    },
    [applyIds, selectedIds],
  );

  return {
    selectedIds,
    count: selectedIds.length,
    isSelected,
    toggleId,
    replaceId,
    removeId,
    moveByIndex,
    maxReached,
  };
}

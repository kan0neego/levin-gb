import { Button, Icon } from "@wordpress/components";
import { closeSmall, dragHandle } from "@wordpress/icons";
import { useSortableList } from "@lib/hooks/use-sortable-list";

import { REMOVE_LABEL } from "./constants";
import { getRecordLabel, isDraftRecord } from "./helpers";

/**
 * Список выбранных записей с ручной сортировкой.
 *
 * Порядок элементов здесь — источник истины для порядка вывода на сайте.
 * Перестановка — перетаскиванием строки за маркер либо сочетанием `Alt` +
 * стрелки вверх/вниз на сфокусированной строке.
 *
 * @param {Object}   props
 * @param {string}   props.instanceId - Уникальный префикс DOM-id строк.
 * @param {Array}    props.ids        - Упорядоченный список ID записей.
 * @param {Map}      props.records    - ID записи → запись REST API.
 * @param {Function} props.onMove     - Перестановка `(from, to)`.
 * @param {Function} props.onRemove   - Удаление записи.
 * @param {boolean}  props.sortable   - Показывать сортировку и маркеры.
 * @returns {import("react").JSX.Element}
 */
export function RelationSelected({
  instanceId,
  ids,
  records,
  onMove,
  onRemove,
  sortable = true,
}) {
  const getRowId = (index) => `${instanceId}-row-${ids[index]}`;

  const {
    dragIndex,
    dropTarget,
    resetDrag,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleKeyDown,
  } = useSortableList({
    count: ids.length,
    orderKey: ids.join("-"),
    getRowId,
    onMove,
  });

  return (
    <ul
      className="post-relation-control__list"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      {ids.map((id, index) => {
        // Ключи карт строковые: ID из REST и из атрибута могут отличаться
        // типом.
        const record = records.get(String(id));
        const title = getRecordLabel(record);
        const isDragging = dragIndex === index;
        const isBefore =
          dropTarget?.index === index && dropTarget.position === "before";
        const isAfter =
          dropTarget?.index === index && dropTarget.position === "after";
        const rowClassName = [
          "post-relation-control__row",
          isDragging ? "is-dragging" : "",
          isBefore ? "is-drop-before" : "",
          isAfter ? "is-drop-after" : "",
          record ? "" : "is-missing",
          isDraftRecord(record) ? "is-draft" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li
            key={id}
            id={`${instanceId}-row-${id}`}
            className={rowClassName}
            tabIndex={-1}
            draggable={sortable && ids.length > 1}
            onDragStart={sortable ? handleDragStart(index) : undefined}
            onDragOver={sortable ? handleDragOver(index) : undefined}
            onDragEnd={sortable ? resetDrag : undefined}
            onKeyDown={sortable ? handleKeyDown(index) : undefined}
          >
            {sortable && (
              <span
                className="post-relation-control__handle"
                aria-hidden="true"
              >
                <Icon icon={dragHandle} size={18} />
              </span>
            )}
            {sortable && (
              <span className="post-relation-control__row-index">
                {index + 1}
              </span>
            )}
            <span className="post-relation-control__row-title" title={title}>
              {title}
            </span>
            <span className="post-relation-control__row-actions">
              <Button
                size="small"
                icon={closeSmall}
                label={REMOVE_LABEL}
                onClick={() => onRemove(id)}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

import { useCallback, useEffect, useRef, useState } from "@wordpress/element";

/**
 * Вычисляет индекс вставки перетаскиваемого элемента.
 *
 * @param {number} from     Текущий индекс перетаскиваемого элемента.
 * @param {number} target   Индекс элемента под курсором.
 * @param {string} position Позиция курсора: `before` или `after`.
 * @returns {number} Индекс, на который нужно вставить элемент.
 */
export function resolveDropIndex(from, target, position) {
  const to = target + (position === "after" ? 1 : 0);

  return from < to ? to - 1 : to;
}

/**
 * Сортировка списка перетаскиванием.
 *
 * Реализовано на нативных событиях HTML5 drag-and-drop: компонент `Draggable`
 * из `@wordpress/components` рассчитан на перетаскивание блоков (клонирует
 * узел по `elementId`, передаёт данные как HTML) и не предоставляет
 * обработчиков для drop-стороны. Кнопки «выше»/«ниже» и `Alt` + стрелки
 * дублируют сортировку для клавиатуры и тач-устройств, где HTML5 DnD
 * не работает.
 *
 * @param {Object}   options
 * @param {number}   options.count    - Количество элементов в списке.
 * @param {string}   options.orderKey - Ключ, меняющийся при смене порядка.
 * @param {Function} options.getRowId - Индекс → DOM-id строки (для фокуса).
 * @param {Function} options.onMove   - Обработчик перестановки `(from, to)`.
 * @returns {Object} Состояние перетаскивания и обработчики событий.
 */
export function useSortableList({ count, orderKey, getRowId, onMove }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const pendingFocusRef = useRef(null);

  // React пересоздаёт узлы при смене порядка, поэтому браузер теряет фокус,
  // а вместе с ним — возможность двигать элемент дальше с клавиатуры.
  useEffect(() => {
    const pending = pendingFocusRef.current;
    pendingFocusRef.current = null;

    if (!pending) {
      return;
    }

    const node = document.getElementById(pending);

    if (node) {
      node.focus();
    }
  }, [orderKey]);

  const resetDrag = useCallback(() => {
    setDragIndex(null);
    setDropTarget(null);
  }, []);

  const move = useCallback(
    (from, to) => {
      if (from === to || to < 0 || to >= count) {
        return;
      }

      pendingFocusRef.current = getRowId(from);
      onMove(from, to);
    },
    [count, getRowId, onMove],
  );

  const moveByOffset = useCallback(
    (index, offset) => move(index, index + offset),
    [move],
  );

  const handleDragStart = (index) => (event) => {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (index) => (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    const rect = event.currentTarget.getBoundingClientRect();
    const middle = rect.top + rect.height / 2;

    setDropTarget({
      index,
      position: event.clientY < middle ? "before" : "after",
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const raw = dragIndex ?? event.dataTransfer.getData("text/plain");
    const from = Number.parseInt(raw, 10);

    if (Number.isNaN(from) || !dropTarget) {
      resetDrag();
      return;
    }

    const to = resolveDropIndex(from, dropTarget.index, dropTarget.position);

    resetDrag();
    move(from, to);
  };

  const handleKeyDown = (index) => (event) => {
    if (!event.altKey) {
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveByOffset(index, -1);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveByOffset(index, 1);
    }
  };

  return {
    dragIndex,
    dropTarget,
    resetDrag,
    moveByOffset,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleKeyDown,
  };
}

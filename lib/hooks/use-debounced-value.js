import { useEffect, useState } from "@wordpress/element";

/**
 * Отложенное значение — снижает частоту запросов при вводе.
 *
 * @param {*}      value Текущее значение.
 * @param {number} delay Задержка в миллисекундах.
 * @returns {*} Значение, обновлённое после задержки.
 */
export function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

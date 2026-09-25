import apiFetch from "@wordpress/api-fetch";
import { useEffect, useState } from "@wordpress/element";

/** Маршрут роута с кейсами врача: `%d` заменяется на ID записи. */
const ROUTE = "/theme/v1/doctor/%d/cases";

/**
 * Кейсы, привязанные к текущей записи через ACF-поле `case_related_doctors`.
 *
 * Список отдаёт серверный роут, который использует тот же метод, что и вывод
 * на сайте. Фильтровать коллекцию записей по ACF-мете через REST нельзя:
 * параметр с именем поля не описан в схеме контроллера, и WordPress молча
 * отдаёт все записи подряд — предпросмотр показывал бы не то, что выведет
 * фронт.
 *
 * @param {Object}  options
 * @param {number}  options.postId  - ID редактируемой записи.
 * @param {boolean} options.enabled - Включена ли опция панели.
 * @returns {Object} Кейсы записи: слайды и состояние запроса.
 */
export function usePostCases({ postId, enabled }) {
  const [slides, setSlides] = useState([]);
  const [isResolving, setIsResolving] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    if (!enabled || !postId) {
      setSlides([]);
      setIsResolving(false);
      setIsUnavailable(false);
      return undefined;
    }

    let isActual = true;

    setIsResolving(true);
    setIsUnavailable(false);

    apiFetch({ path: ROUTE.replace("%d", postId) })
      .then((records) => {
        if (isActual) {
          setSlides(Array.isArray(records) ? records : []);
        }
      })
      .catch(() => {
        if (isActual) {
          setSlides([]);
          setIsUnavailable(true);
        }
      })
      .finally(() => {
        if (isActual) {
          setIsResolving(false);
        }
      });

    // Запрос устаревает, если опцию сняли или сменили запись.
    return () => {
      isActual = false;
    };
  }, [postId, enabled]);

  return { slides, isResolving, isUnavailable };
}

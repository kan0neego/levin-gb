import { useEntityRecords } from "@wordpress/core-data";
import { useMemo } from "@wordpress/element";

import { TERMS_PER_PAGE } from "./constants";
import { fromIdsKey, getRecordTitle, toIdsKey } from "./helpers";

const TERMS_QUERY = {
  per_page: TERMS_PER_PAGE,
  orderby: "name",
  order: "asc",
};

/**
 * Данные контрола: термины таксономии, результаты поиска и заголовки
 * выбранных записей.
 *
 * Поиск и таксономия уходят в один запрос, поэтому пересечение считает
 * сервер: поиск выполняется только по записям выбранного термина, а не по
 * локально загруженной выборке.
 *
 * @param {Object} options
 * @param {string} options.postType  - Слаг типа записи.
 * @param {string} options.taxonomy  - Слаг таксономии фильтра.
 * @param {string} options.search    - Поисковая строка (без пробелов).
 * @param {string} options.termId    - ID выбранного термина ("" — все).
 * @param {number} options.perPage   - Размер выборки результатов.
 * @param {Array}  options.selectedIds - ID выбранных записей.
 * @returns {Object} Данные запросов и признаки недоступности сущностей.
 */
export function useRelationData({
  postType,
  taxonomy,
  search,
  termId,
  perPage,
  selectedIds,
}) {
  const entityEnabled = Boolean(postType);
  const taxonomyEnabled = Boolean(taxonomy);

  // Термины для фильтра. Запрос отключается, если таксономия не задана,
  // поэтому `null` в аргументе `name` безопасен.
  const {
    records: termRecords,
    isResolving: termsResolving,
    hasResolved: termsResolved,
  } = useEntityRecords("taxonomy", taxonomy, TERMS_QUERY, {
    enabled: taxonomyEnabled,
  });

  const postsQuery = useMemo(() => {
    const query = {
      per_page: perPage,
      orderby: "title",
      order: "asc",
    };

    if (search) {
      query.search = search;
    }

    if (termId && taxonomyEnabled) {
      query[taxonomy] = termId;
    }

    return query;
  }, [perPage, search, termId, taxonomy, taxonomyEnabled]);

  const {
    records: postRecords,
    isResolving: postsResolving,
    hasResolved: postsResolved,
  } = useEntityRecords("postType", postType, postsQuery, {
    enabled: entityEnabled,
  });

  const posts = postRecords ?? [];

  // Заголовки выбранных записей нужны отдельным запросом: они могут не
  // попадать в текущую выборку фильтров. ID сортируются, чтобы перестановка
  // не меняла ключ запроса и не вызывала повторный запрос.
  const includedIds = useMemo(
    () => fromIdsKey(toIdsKey(selectedIds)),
    [selectedIds],
  );

  const selectedQuery = useMemo(
    () => ({
      include: includedIds,
      per_page: Math.max(includedIds.length, 1),
    }),
    [includedIds],
  );

  const { records: selectedRecords } = useEntityRecords(
    "postType",
    postType,
    selectedQuery,
    { enabled: entityEnabled && includedIds.length > 0 },
  );

  // Заголовки: из выборки выбранных записей и из текущих результатов
  // (второе перекрывает первое — данные свежее).
  const titles = useMemo(() => {
    const map = new Map();

    [selectedRecords ?? [], posts].forEach((collection) => {
      collection.forEach((record) => {
        map.set(String(record.id), getRecordTitle(record));
      });
    });

    return map;
  }, [selectedRecords, posts]);

  return {
    terms: termRecords ?? [],
    termsResolving,
    termsResolved,
    // Сущность отсутствует в REST API, если резолвер не нашёл её
    // конфигурацию: запрос не выполняется, `records` остаётся `null`, но
    // резолюция считается завершённой (ошибка не бросается).
    taxonomyUnavailable:
      taxonomyEnabled && termsResolved && termRecords === null,
    posts,
    postsResolving,
    postsUnavailable: entityEnabled && postsResolved && postRecords === null,
    titles,
  };
}

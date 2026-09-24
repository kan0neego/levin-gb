import { Notice } from "@wordpress/components";
import { useInstanceId } from "@wordpress/compose";
import { useEffect } from "@wordpress/element";

import { ALL_TERMS, DEFAULT_PER_PAGE, EMPTY_SELECTED_LABEL } from "./constants";
import { RelationPicker } from "./relation-picker";
import { RelationSelected } from "./relation-selected";
import { useRelationData } from "./use-relation-data";
import { useRelationFilters } from "./use-relation-filters";
import { useRelationSelection } from "./use-relation-selection";

import "./index.scss";

/**
 * Reusable контрол выбора записей — аналог поля «Родственные связи» из ACF.
 *
 * Компонент не знает ни о типе записи, ни о форме хранения значения в блоке:
 * тип записи передаётся пропом `postType`, а ключ идентификатора внутри
 * элемента массива — пропом `valueKey`. На выходе всегда получается
 * упорядоченный массив вида `[{ [valueKey]: id }, …]`, поэтому порядок
 * элементов сразу является порядком вывода на сайте.
 *
 * Фильтры: поиск по названию и выбор термина таксономии. Оба ограничения
 * уходят на сервер в одном запросе, поэтому поиск выполняется только по
 * записям, подошедшим по выбранной таксономии.
 *
 * Компонент только собирает данные и разметку: состояние выбора —
 * `useRelationSelection`, состояние фильтров — `useRelationFilters`,
 * запросы — `useRelationData`.
 *
 * @param {Object}   props
 * @param {Array}    props.value              - Текущее значение блока.
 * @param {Function} props.onChange           - Получает новое значение.
 * @param {string}   props.valueKey           - Ключ ID внутри элемента.
 * @param {string}   props.postType           - Слаг типа записи.
 * @param {string}   props.taxonomy           - Слаг таксономии для фильтра.
 * @param {number}   props.perPage            - Размер выборки результатов.
 * @param {number}   props.maxItems           - Лимит выбранных (0 — нет).
 * @param {string}   props.addLabel           - Текст кнопки добавления.
 * @param {string}   props.selectedLabel      - Заголовок блока выбранных.
 * @param {string}   props.taxonomyLabel      - Подпись фильтра таксономии.
 * @param {string}   props.searchLabel        - Подпись поля поиска.
 * @param {string}   props.searchPlaceholder  - Плейсхолдер поля поиска.
 * @param {string}   props.emptyLabel         - Текст при пустой выдаче.
 * @param {string}   props.hint               - Подсказка над контролом.
 * @param {string}   props.className          - Дополнительный CSS-класс.
 * @returns {import("react").JSX.Element}
 */
export function PostRelationControl({
  value = [],
  onChange,
  valueKey = "id",
  postType,
  taxonomy = null,
  perPage = DEFAULT_PER_PAGE,
  maxItems = 0,
  addLabel = "Добавить записи",
  selectedLabel = "Выбрано",
  taxonomyLabel = "Фильтр по таксономии",
  searchLabel = "Поиск",
  searchPlaceholder = "Начните вводить название…",
  emptyLabel = "Записи не найдены",
  hint = "",
  className = "",
}) {
  const instanceId = useInstanceId(PostRelationControl, "post-relation");
  const entityEnabled = Boolean(postType);

  const {
    selectedIds,
    count,
    isSelected,
    toggleId,
    removeId,
    moveByIndex,
    maxReached,
  } = useRelationSelection({ value, onChange, valueKey, maxItems });

  const {
    search,
    setSearch,
    termId,
    setTermId,
    normalizedSearch,
    hasActiveFilters,
    reset: resetFilters,
  } = useRelationFilters({ postType, taxonomy });

  const {
    terms,
    termsResolving,
    termsResolved,
    taxonomyUnavailable,
    posts,
    postsResolving,
    postsUnavailable,
    records,
  } = useRelationData({
    postType,
    taxonomy,
    search: normalizedSearch,
    termId,
    perPage,
    selectedIds,
  });

  // Термин, исчезнувший из таксономии, сбрасываем на «все».
  useEffect(() => {
    if (!termId || !termsResolved) {
      return;
    }

    if (!terms.some((term) => String(term.id) === String(termId))) {
      setTermId(ALL_TERMS);
    }
  }, [termId, terms, termsResolved, setTermId]);

  const labels = {
    addLabel,
    selectedLabel,
    taxonomyLabel,
    searchLabel,
    searchPlaceholder,
    emptyLabel,
  };

  return (
    <div
      className={["post-relation-control", className].filter(Boolean).join(" ")}
    >
      {!entityEnabled && (
        <Notice
          status="error"
          isDismissible={false}
          className="post-relation-control__notice"
        >
          Не указан тип записи: передайте слаг в проп `postType`.
        </Notice>
      )}
      {postsUnavailable && (
        <Notice
          status="error"
          isDismissible={false}
          className="post-relation-control__notice"
        >
          Записи типа «{postType}» недоступны в REST API. Включите «Показывать в
          REST API» в настройках типа записи.
        </Notice>
      )}
      {maxReached && (
        <Notice
          status="warning"
          isDismissible={false}
          className="post-relation-control__notice"
        >
          Достигнут лимит: можно выбрать не более {maxItems} записей.
        </Notice>
      )}
      {hint && <p className="post-relation-control__hint">{hint}</p>}

      {entityEnabled && !postsUnavailable && (
        <RelationPicker
          labels={labels}
          selected={count}
          limit={maxItems}
          filters={{
            state: {
              termId,
              search,
              termsResolving,
              taxonomyUnavailable,
              hasActiveFilters,
            },
            terms,
            onTermChange: setTermId,
            onSearchChange: setSearch,
            onReset: resetFilters,
          }}
          results={{
            posts,
            isResolving: postsResolving,
            isSelected,
            onToggle: toggleId,
          }}
        />
      )}

      <div className="post-relation-control__selected">
        <p className="post-relation-control__selected-head">
          {`${selectedLabel}: ${count}`}
          {maxItems > 0 && (
            <span className="post-relation-control__limit">
              {` / ${maxItems}`}
            </span>
          )}
        </p>
        {count === 0 && (
          <p className="post-relation-control__state">{EMPTY_SELECTED_LABEL}</p>
        )}
        {count > 0 && (
          <RelationSelected
            instanceId={instanceId}
            ids={selectedIds}
            records={records}
            onMove={moveByIndex}
            onRemove={removeId}
          />
        )}
      </div>
    </div>
  );
}

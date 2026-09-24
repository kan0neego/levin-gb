import {
  Button,
  Notice,
  SearchControl,
  SelectControl,
} from "@wordpress/components";
import { useMemo } from "@wordpress/element";
import { decodeEntities } from "@wordpress/html-entities";

import { ALL_TERMS, ALL_TERMS_LABEL } from "./constants";

/**
 * Фильтры результатов: поиск и выбор термина таксономии.
 *
 * Если таксономия недоступна в REST API, селект блокируется и выводится
 * предупреждение — блок при этом продолжает работать.
 *
 * @param {Object}   props
 * @param {Object}   props.labels         - Подписи элементов.
 * @param {Object}   props.state          - Текущее состояние фильтров.
 * @param {Array}    props.terms          - Термины таксономии.
 * @param {Function} props.onReset        - Сброс всех фильтров.
 * @param {Function} props.onSearchChange - Изменение поисковой строки.
 * @param {Function} props.onTermChange   - Изменение выбранного термина.
 * @returns {import("react").JSX.Element}
 */
export function RelationFilters({
  labels,
  state,
  terms,
  onReset,
  onSearchChange,
  onTermChange,
}) {
  const {
    termId,
    search,
    termsResolving,
    taxonomyUnavailable,
    hasActiveFilters,
  } = state;

  const termOptions = useMemo(
    () => [
      { label: ALL_TERMS_LABEL, value: ALL_TERMS },
      ...terms.map((term) => ({
        label: decodeEntities(term.name),
        value: String(term.id),
      })),
    ],
    [terms],
  );

  return (
    <div className="post-relation-control__filters">
      <SelectControl
        className="post-relation-control__filter"
        label={labels.taxonomyLabel}
        value={termId}
        options={termOptions}
        onChange={onTermChange}
        disabled={termsResolving || taxonomyUnavailable}
      />
      {taxonomyUnavailable && (
        <Notice
          status="warning"
          isDismissible={false}
          className="post-relation-control__notice"
        >
          Таксономия недоступна в REST API. Включите «Показывать в REST API» в
          настройках таксономии, чтобы фильтровать по ней.
        </Notice>
      )}
      <SearchControl
        className="post-relation-control__filter"
        label={labels.searchLabel}
        value={search}
        placeholder={labels.searchPlaceholder}
        onChange={onSearchChange}
      />
      {hasActiveFilters && (
        <Button
          variant="link"
          className="post-relation-control__reset"
          onClick={onReset}
        >
          Сбросить фильтры
        </Button>
      )}
    </div>
  );
}

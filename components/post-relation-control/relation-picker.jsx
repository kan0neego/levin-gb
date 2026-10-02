import {
  Button,
  CheckboxControl,
  Dropdown,
  RadioControl,
  Spinner,
} from "@wordpress/components";
import { chevronDown } from "@wordpress/icons";

import { getRecordLabel, isDraftRecord } from "./helpers";
import { RelationFilters } from "./relation-filters";

/**
 * Дропдаун выбора записей: фильтры и список результатов с чекбоксами.
 *
 * В режиме `select` уже выбранные записи остаются в списке, но помечаются и
 * блокируются — удалять их удобнее из списка выбранного, где виден порядок.
 * В режиме `single` выбор заменяет единственную запись, поэтому галочки
 * превращаются в радио и выбранная запись не блокируется.
 *
 * @param {Object} props
 * @param {Object} props.labels    - Подписи элементов.
 * @param {Object} props.filters   - Данные и обработчики фильтров.
 * @param {Object} props.results   - Результаты запроса и обработчики выбора.
 * @param {number} props.selected  - Сколько записей уже выбрано.
 * @param {number} props.limit     - Лимит выбранных записей (0 — без лимита).
 * @param {string} props.selectionMode - Режим выбора: `select` или `single`.
 * @param {boolean} props.lockSelected - Блокировать выбранные записи в выдаче.
 * @returns {import("react").JSX.Element}
 */
export function RelationPicker({
  labels,
  filters,
  results,
  selected,
  limit,
  selectionMode = "select",
  lockSelected = false,
}) {
  const { posts, isResolving, isSelected, selectedIds, onToggle, onSelect } =
    results;
  const isSingle = selectionMode === "single";
  const maxReached = limit > 0 && selected >= limit;

  return (
    <Dropdown
      className="post-relation-control__picker"
      contentClassName="post-relation-control__picker-content"
      popoverProps={{ placement: "bottom-start", resize: false }}
      renderToggle={({ isOpen, onToggle: toggle }) => (
        <Button
          variant="secondary"
          className="post-relation-control__add"
          onClick={toggle}
          aria-expanded={isOpen}
          icon={chevronDown}
          iconPosition="right"
          disabled={maxReached}
        >
          {labels.addLabel}
        </Button>
      )}
      renderContent={() => (
        <div className="post-relation-control__picker-inner">
          <RelationFilters {...filters} labels={labels} />
          <div className="post-relation-control__results">
            {isResolving && (
              <p className="post-relation-control__state">
                <Spinner />
                Загружаем…
              </p>
            )}
            {!isResolving && posts.length === 0 && (
              <p className="post-relation-control__state">
                {labels.emptyLabel}
              </p>
            )}
            {!isResolving && posts.length > 0 && isSingle && (
              <RadioControl
                selected={
                  selectedIds.length > 0 ? String(selectedIds[0]) : undefined
                }
                options={posts.map((record) => ({
                  label: getRecordLabel(record),
                  value: String(record.id),
                }))}
                onChange={(value) => onSelect(value)}
                className="post-relation-control__results-list"
              />
            )}
            {!isResolving && posts.length > 0 && !isSingle && (
              <ul className="post-relation-control__results-list">
                {posts.map((record) => {
                  const taken = isSelected(record.id);
                  const blocked = maxReached || (taken && lockSelected);
                  const title = getRecordLabel(record);
                  const itemClass = isDraftRecord(record)
                    ? "is-draft"
                    : undefined;

                  return (
                    <li key={record.id} className={itemClass}>
                      <CheckboxControl
                        label={title}
                        checked={taken}
                        aria-disabled={blocked || undefined}
                        onChange={(checked) => {
                          if (blocked) {
                            return;
                          }

                          onToggle(record.id, checked);
                        }}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    />
  );
}

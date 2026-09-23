import { Button, Icon } from "@wordpress/components";
import {
	arrowDown,
	arrowUp,
	closeSmall,
	dragHandle,
} from "@wordpress/icons";
import { useSortableList } from "@lib/hooks/use-sortable-list";

/**
 * Список выбранных записей с ручной сортировкой.
 *
 * Порядок элементов здесь — источник истины для порядка вывода на сайте.
 *
 * @param {Object}   props
 * @param {string}   props.instanceId - Уникальный префикс DOM-id строк.
 * @param {Array}    props.ids        - Упорядоченный список ID записей.
 * @param {Map}      props.titles     - ID записи → заголовок.
 * @param {Object}   props.labels     - Подписи элементов.
 * @param {Function} props.onMove     - Перестановка `(from, to)`.
 * @param {Function} props.onRemove   - Удаление записи.
 * @returns {import("react").JSX.Element}
 */
export function RelationSelected({
	instanceId,
	ids,
	titles,
	labels,
	onMove,
	onRemove,
}) {
	const getRowId = (index) => `${instanceId}-row-${ids[index]}`;

	const {
		dragIndex,
		dropTarget,
		resetDrag,
		moveByOffset,
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
				// Ключи карты заголовков строковые: ID из REST и из атрибута могут
				// отличаться типом.
				const title = titles.get(String(id));
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
				]
					.filter(Boolean)
					.join(" ");

				return (
					<li
						key={id}
						id={`${instanceId}-row-${id}`}
						className={rowClassName}
						tabIndex={-1}
						draggable={ids.length > 1}
						onDragStart={handleDragStart(index)}
						onDragOver={handleDragOver(index)}
						onDragEnd={resetDrag}
						onKeyDown={handleKeyDown(index)}
					>
						<span className="post-relation-control__handle" aria-hidden="true">
							<Icon icon={dragHandle} size={18} />
						</span>
						<span className="post-relation-control__row-index">
							{index + 1}
						</span>
						<span className="post-relation-control__row-title" title={title}>
							{title || labels.missingTitleLabel}
						</span>
						<span className="post-relation-control__row-actions">
							<Button
								size="small"
								icon={arrowUp}
								label={labels.moveUpLabel}
								disabled={index === 0}
								onClick={() => moveByOffset(index, -1)}
							/>
							<Button
								size="small"
								icon={arrowDown}
								label={labels.moveDownLabel}
								disabled={index === ids.length - 1}
								onClick={() => moveByOffset(index, 1)}
							/>
							<Button
								size="small"
								icon={closeSmall}
								label={labels.removeLabel}
								onClick={() => onRemove(id)}
							/>
						</span>
					</li>
				);
			})}
		</ul>
	);
}

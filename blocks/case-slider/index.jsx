import { SliderContext } from "@components/slider/context";
import { Slide } from "@components/slider/slide";
import { Slider } from "@components/slider/slider";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { CheckboxControl, PanelBody, Spinner } from "@wordpress/components";
import { useEntityRecords } from "@wordpress/core-data";
import { useMemo, useState } from "@wordpress/element";
import { decodeEntities } from "@wordpress/html-entities";
import { ServerSideRender } from "@wordpress/server-side-render";
import { SliderButton } from "@components/slider/slider-button";
import { SliderPagination } from "@components/slider/slider-pagination";
import { SliderWrapper } from "@components/slider/slider-wrapper";

import metadata from "./block.json";
import "./index.scss";

const ALL_CASES_QUERY = { perPage: 100, orderby: "title", order: "asc" };

const getTitle = (record) => decodeEntities(record.title?.rendered ?? "");

/**
 * Чекбокс «выбрать всю категорию» с поддержкой частичного выбора (indeterminate).
 *
 * @param {Object}                    props
 * @param {Object}                    props.category
 * @param {number}                    props.selected - Сколько кейсов выбрано.
 * @param {number}                    props.total    - Всего кейсов в категории.
 * @param {(checked: boolean) => void} props.onToggle
 * @returns {import("react").JSX.Element}
 */
function CategoryCheckbox({ category, selected, total, onToggle }) {
	const partially = total > 0 && selected > 0 && selected < total;
	const checked = total > 0 && selected === total;

	return (
		<div className={`category-tree-category${partially ? " is-partial" : ""}`}>
			<CheckboxControl
				label={decodeEntities(category.name)}
				checked={checked}
				indeterminate={partially}
				onChange={onToggle}
			/>
			<span className="category-tree-count">
				({selected}/{total})
			</span>
		</div>
	);
}

/**
 * Вложенный список «Категория → кейсы».
 *
 * Для каждой категории показываем чекбокс «выбрать всю категорию» и список её
 * кейсов с чекбоксами. Всё наполняет единый источник `slides`.
 *
 * @param {Object}   props
 * @param {Array}    props.slides       - Текущие слайды: [{ caseId }].
 * @param {string}   props.taxonomy     - Слаг таксономии категорий.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @returns {import("react").JSX.Element}
 */
function CategoryTree({ slides, taxonomy, setAttributes }) {
	const { records: categoryRecords, isResolving: resolvingCategories } =
		useEntityRecords("taxonomy", taxonomy);
	const { records: caseRecords, isResolving: resolvingCases } =
		useEntityRecords("postType", "cases", ALL_CASES_QUERY);

	const selectedIds = useMemo(
		() => slides.map((slide) => slide.caseId),
		[slides],
	);
	const isSelected = (caseId) => selectedIds.includes(caseId);

	const applyChanges = (addIds, removeIds) => {
		const addSet = new Set(addIds.filter((id) => !selectedIds.includes(id)));
		const removeSet = new Set(removeIds);
		const next = [
			...slides,
			...Array.from(addSet).map((caseId) => ({ caseId })),
		].filter((slide) => !removeSet.has(slide.caseId));
		setAttributes({ slides: next });
	};

	const toggleCase = (caseId, checked) => {
		if (checked) {
			applyChanges([caseId], []);
		} else {
			applyChanges([], [caseId]);
		}
	};

	const toggleCategory = (caseIds, checked) => {
		if (checked) {
			applyChanges(caseIds, []);
		} else {
			applyChanges([], caseIds);
		}
	};

	const isResolving = resolvingCategories || resolvingCases;
	const categories = categoryRecords ?? [];
	const cases = caseRecords ?? [];

	const uncategorizedCases = cases.filter(
		(record) =>
			!Array.isArray(record.categories) || record.categories.length === 0,
	);

	return (
		<div className="category-tree">
			{isResolving && (
				<p className="category-tree-loading">
					<Spinner /> Загружаем категории…
				</p>
			)}
			{!isResolving && categories.length === 0 && (
				<p className="category-tree-empty">Категории не найдены</p>
			)}
			{!isResolving && categories.length > 0 && (
				<ul className="category-tree-list">
					{categories.map((category) => {
						const catId = category.id;
						const catCases = cases.filter((record) =>
							record.categories.includes(catId),
						);
						const selected = catCases.filter((record) =>
							isSelected(record.id),
						).length;

						return (
							<li key={catId} className="category-tree-item">
								<CategoryCheckbox
									category={category}
									selected={selected}
									total={catCases.length}
									onToggle={(checked) =>
										toggleCategory(
											catCases.map((r) => r.id),
											checked,
										)
									}
								/>
								{catCases.length > 0 && (
									<ul className="category-tree-cases">
										{catCases.map((record) => (
											<li key={record.id}>
												<CheckboxControl
													label={getTitle(record)}
													checked={isSelected(record.id)}
													onChange={(checked) => toggleCase(record.id, checked)}
												/>
											</li>
										))}
									</ul>
								)}
							</li>
						);
					})}
				</ul>
			)}
			{!isResolving && uncategorizedCases.length > 0 && (
				<div className="category-tree-uncategorized">
					<span className="category-tree-uncategorized-title">
						Без категории
					</span>
					<ul className="category-tree-cases">
						{uncategorizedCases.map((record) => (
							<li key={record.id}>
								<CheckboxControl
									label={getTitle(record)}
									checked={isSelected(record.id)}
									onChange={(checked) => toggleCase(record.id, checked)}
								/>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

/**
 * Пространство настроек блока в сайдбаре: вложенный список категорий.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @returns {import("react").JSX.Element}
 */
function EditorTools({ attributes, setAttributes }) {
	const { slides, taxonomy } = attributes;

	return (
		<InspectorControls>
			<PanelBody title="Кейсы слайдера" initialOpen>
				<p className="case-settings-hint">
					Выберите кейсы по категориям. Отметка категории включает все её кейсы,
					отдельные кейсы можно убрать или добавить точечно.
				</p>
				<CategoryTree
					slides={slides}
					taxonomy={taxonomy}
					setAttributes={setAttributes}
				/>
			</PanelBody>
		</InspectorControls>
	);
}

/**
 * Виджет блока в редакторе.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @returns {import("react").JSX.Element}
 */
function CaseSliderWidget({ attributes, setAttributes }) {
	const { slides } = attributes;
	const blockProps = useBlockProps();
	const [activeIndex, setActiveIndex] = useState(0);
	const slidesKey = slides.map((slide) => slide.caseId).join("-");

	const hasSlides = slides.length > 0;

	return (
		<>
			<div {...blockProps}>
				{hasSlides && (
					<div className="case-slider">
						<SliderContext.Provider value={{ activeIndex, setActiveIndex }}>
							<Slider slidesKey={slidesKey} option="cases" perView={1}>
								<SliderWrapper>
									{slides.map((slide) => (
										<Slide key={slide.caseId}>
											<ServerSideRender
												block="theme/case-list"
												attributes={{ caseId: slide.caseId }}
											/>
										</Slide>
									))}
								</SliderWrapper>
								<SliderPagination />
								<div className="swiper-navigation">
									<SliderButton type="prev" />
									<SliderButton type="next" />
								</div>
							</Slider>
						</SliderContext.Provider>
					</div>
				)}
				{!hasSlides && (
					<div
						className="case-slider-empty"
						aria-hidden="true"
						title="Кейсы не выбраны"
					/>
				)}
			</div>
			<EditorTools attributes={attributes} setAttributes={setAttributes} />
		</>
	);
}

registerBlockType(metadata.name, {
	...metadata,

	edit: function ({ attributes, setAttributes }) {
		return (
			<CaseSliderWidget attributes={attributes} setAttributes={setAttributes} />
		);
	},

	save: () => null,
});

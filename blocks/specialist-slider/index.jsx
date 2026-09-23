import { SliderContext } from "@components/slider/context";
import { Slide } from "@components/slider/slide";
import { Slider } from "@components/slider/slider";
import { SliderButton } from "@components/slider/slider-button";
import { SliderPagination } from "@components/slider/slider-pagination";
import { SliderWrapper } from "@components/slider/slider-wrapper";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { CheckboxControl, PanelBody, Spinner } from "@wordpress/components";
import { useEntityRecords } from "@wordpress/core-data";
import { useMemo, useState } from "@wordpress/element";
import { decodeEntities } from "@wordpress/html-entities";
import { ServerSideRender } from "@wordpress/server-side-render";

import metadata from "./block.json";
import "./editor.scss";
import "./index.scss";

const ALL_DOCTORS_QUERY = { perPage: 100, orderby: "title", order: "asc" };

const getTitle = (record) => decodeEntities(record.title?.rendered ?? "");

/**
 * Список специалистов с чекбоксами.
 *
 * Единый источник слайдов — атрибут `slides`. Каждая отметка добавляет запись
 * `{ doctorId }`, снятие отметки — удаляет её.
 *
 * @param {Object}   props
 * @param {Array}    props.slides        - Текущие слайды: [{ doctorId }].
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @returns {import("react").JSX.Element}
 */
function DoctorList({ slides, setAttributes }) {
	const { records: doctorRecords, isResolving } = useEntityRecords(
		"postType",
		"doctors",
		ALL_DOCTORS_QUERY,
	);

	const selectedIds = useMemo(
		() => slides.map((slide) => slide.doctorId),
		[slides],
	);
	const isSelected = (doctorId) => selectedIds.includes(doctorId);

	const applyChanges = (addIds, removeIds) => {
		const addSet = new Set(addIds.filter((id) => !selectedIds.includes(id)));
		const removeSet = new Set(removeIds);
		const next = [
			...slides,
			...Array.from(addSet).map((doctorId) => ({ doctorId })),
		].filter((slide) => !removeSet.has(slide.doctorId));
		setAttributes({ slides: next });
	};

	const toggleDoctor = (doctorId, checked) => {
		if (checked) {
			applyChanges([doctorId], []);
		} else {
			applyChanges([], [doctorId]);
		}
	};

	const doctors = doctorRecords ?? [];

	return (
		<div className="doctor-list">
			{isResolving && (
				<p className="doctor-list-loading">
					<Spinner /> Загружаем специалистов…
				</p>
			)}
			{!isResolving && doctors.length === 0 && (
				<p className="doctor-list-empty">Специалисты не найдены</p>
			)}
			{!isResolving && doctors.length > 0 && (
				<ul className="doctor-list-items">
					{doctors.map((record) => (
						<li key={record.id}>
							<CheckboxControl
								label={getTitle(record)}
								checked={isSelected(record.id)}
								onChange={(checked) => toggleDoctor(record.id, checked)}
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

/**
 * Пространство настроек блока в сайдбаре: список специалистов.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    - Атрибуты блока.
 * @param {Function} props.setAttributes - setter атрибутов блока.
 * @returns {import("react").JSX.Element}
 */
function EditorTools({ attributes, setAttributes }) {
	const { slides } = attributes;

	return (
		<InspectorControls>
			<PanelBody title="Специалисты слайдера" initialOpen>
				<p className="specialist-settings-hint">
					Выберите специалистов, которые попадут в слайдер.
				</p>
				<DoctorList slides={slides} setAttributes={setAttributes} />
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
function SpecialistSliderWidget({ attributes, setAttributes }) {
	const { slides } = attributes;
	const blockProps = useBlockProps();
	const [activeIndex, setActiveIndex] = useState(0);
	const slidesKey = slides.map((slide) => slide.doctorId).join("-");

	const hasSlides = slides.length > 0;

	return (
		<>
			<div {...blockProps}>
				{hasSlides && (
					<div className="specialist-slider-wrapper">
						<div className="specialist-slider">
							<SliderContext.Provider value={{ activeIndex, setActiveIndex }}>
								<Slider slidesKey={slidesKey} option="specialist" perView={1}>
									<SliderWrapper>
										{slides.map((slide) => (
											<Slide key={slide.doctorId}>
												<ServerSideRender
													block="theme/specialist-slide"
													attributes={{ doctorId: slide.doctorId }}
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
					</div>
				)}
				{!hasSlides && (
					<div
						className="specialist-slider-empty"
						aria-hidden="true"
						title="Специалисты не выбраны"
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
			<SpecialistSliderWidget
				attributes={attributes}
				setAttributes={setAttributes}
			/>
		);
	},

	save: () => null,
});

import {
	BlockControls,
	InnerBlocks,
	InspectorControls,
	RichText,
	store,
	useBlockProps,
} from "@wordpress/block-editor";
import { createBlock, registerBlockType } from "@wordpress/blocks";
import {
	PanelBody,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
} from "@wordpress/components";
import { useDispatch, useSelect } from "@wordpress/data";
import { useEffect, useState } from "react";
import { isEmpty } from "@/lib/helpers/object";

import metadata from "./block.json";

import "./editor.scss";
import "./index.scss";



const deprecated = [
	{
		attributes: metadata.attributes,
		supports: metadata.supports,
		save: function ({ attributes }) {
			const blockProps = useBlockProps.save();

			return (
				<div {...blockProps} className="tabs-block">
					<div className="tab-buttons">
						{attributes.tabsItems.map((item, index) => {
							const isFirstItem = index === 0;
							const isActive = isFirstItem;

							return (
								<button
									data-tab={item.id}
									className={`tab-button btn-tab soft-yellow ${isActive ? "active" : ""
										}`}
								>
									{item.label}
								</button>
							);
						})}
					</div>
					<div className="tab-tabs">
						<InnerBlocks.Content />
					</div>
				</div>
			);
		},
	},
];

registerBlockType(metadata.name, {
	...metadata,
	edit: function ({ clientId, setAttributes, attributes }) {
		const [init, setInit] = useState(true);
		const { updateBlockAttributes, insertBlock, removeBlock, selectBlock } =
			useDispatch(store);
		const { innerBlocks } = useSelect(
			(select) => {
				const _store = select(store);
				const tabs = _store.getBlocks(clientId);
				return { innerBlocks: tabs };
			},
			[clientId],
		);

		const hasActiveTab = innerBlocks.some(
			(tab) => tab.clientId === attributes.activeTabIndex,
		);

		function selectTab(clientId) {
			setAttributes({ activeTabIndex: clientId });
		}

		function addTab() {
			const tab = createBlock("theme/tab");
			insertBlock(tab, undefined, clientId, false);
			setAttributes({ activeTabIndex: tab.clientId });
		}

		function removeTab() {
			const index = innerBlocks.findIndex(
				(tab) => tab.clientId === attributes.activeTabIndex,
			);
			if (index < 0) return;

			const next = innerBlocks[index - 1] || innerBlocks[index + 1];
			removeBlock(innerBlocks[index].clientId, false);
			setAttributes({ activeTabIndex: next?.clientId ?? "" });
		}

		useEffect(() => {
			if (!init) return;
			if (isEmpty(innerBlocks)) return;

			setAttributes({ activeTabIndex: innerBlocks[0].clientId });
			setInit(false);
		}, [innerBlocks]);

		return (
			<>
				<InspectorControls>
					<PanelBody title="Табы">
						<ToggleControl
							label="Дублировать название"
							checked={attributes.duplicateTitle}
							onChange={(value) =>
								setAttributes({ duplicateTitle: value })
							}
						/>
					</PanelBody>
				</InspectorControls>
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton onClick={addTab}>Добавить таб</ToolbarButton>
						<ToolbarButton
							onClick={removeTab}
							disabled={!hasActiveTab}
						>
							Удалить таб
						</ToolbarButton>
					</ToolbarGroup>
				</BlockControls>
				<div {...useBlockProps({ className: "tabs-block" })}>
					<div className="tab-buttons editor-tab-buttons">
						{innerBlocks.map((tab) => {
							const { label } = tab.attributes;
							const { activeTabIndex } = attributes;
							const isActive = activeTabIndex === tab.clientId;

							return (
								<div
									key={tab.clientId}
									data-tab={tab.clientId}
									className={`tab-button ${isActive ? "active" : ""}`}
									onClick={() => selectTab(tab.clientId)}
								>
									{isActive ? (
										<RichText
											value={label}
											onClick={(e) => e.stopPropagation()}
											allowedFormats={[]}
											disableLineBreaks
											placeholder="Название таба"
											style={{ cursor: "text" }}
											onChange={(value) => {
												setAttributes({
													activeTabIndex: tab.clientId,
												});
												updateBlockAttributes(tab.clientId, {
													label: value,
												});
											}}
											onKeyDown={(e) => {
												if (e.key !== "Enter" || e.shiftKey) return;

												e.preventDefault();
												const content = tab.innerBlocks?.[0];
												if (content) selectBlock(content.clientId);
											}}
										/>
									) : (
										label.length > 0 ? label : "Название таба"
									)}
								</div>
							);
						})}
					</div>
					<div className="tab-tabs">
						<InnerBlocks
							allowedBlocks={["theme/tab"]}
							template={[["theme/tab"], ["theme/tab"]]}
							renderAppender={false}
						/>
					</div>
				</div>
			</>
		);
	},

	save: () => <InnerBlocks.Content />,
	deprecated,
});

import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { heading } = attributes;

	const blockProps = useBlockProps.save( { className: 'stages-list__row' } );

	return (
		<div { ...blockProps }>
			<div className="stages-list__item-heading-container">
				<RichText.Content tagName="div" className="stages-list__item-heading" value={ heading } />
			</div>
			<div className="stages-list__item">
				<div className="stages-list__text-container">
					<InnerBlocks.Content />
				</div>
			</div>
		</div>
	);
}

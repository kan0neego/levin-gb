import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { heading, subheading } = attributes;

	const blockProps = useBlockProps.save( { className: 'card-number' } );

	return (
		<div { ...blockProps }>
			<div className="card-number__order"></div>
			<div className="card-number__text-container">
				<RichText.Content tagName="div" className="card-number__heading" value={ heading } />
				<RichText.Content tagName="div" className="card-number__subheading" value={ subheading } />
				<InnerBlocks.Content />
			</div>
		</div>
	);
}

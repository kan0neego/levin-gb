import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { label } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'accordeon question load',
		'data-isopen': 'false',
	} );

	return (
		<div { ...blockProps }>
			<div className="accordeon__head question__head">
				<RichText.Content tagName="span" value={ label } />
			</div>
			<div className="accordeon__body question__body">
				<div className="accordeon__content question__content">
					<InnerBlocks.Content />
				</div>
			</div>
		</div>
	);
}

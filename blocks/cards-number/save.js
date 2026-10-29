import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save() {
	const blockProps = useBlockProps.save( { className: 'cards-number__wrapper' } );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}

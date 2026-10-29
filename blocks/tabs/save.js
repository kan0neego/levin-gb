import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save() {
	const blockProps = useBlockProps.save( { className: 'containers wide mb-90' } );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}

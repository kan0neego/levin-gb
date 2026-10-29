import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save() {
	const blockProps = useBlockProps.save( { className: 'wp-block-lazyblock-faq' } );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}

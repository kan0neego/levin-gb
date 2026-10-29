import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save() {
	const blockProps = useBlockProps.save( { className: 'wp-block-lazyblock-stages-big' } );

	return (
		<div { ...blockProps }>
			<div className="stages__container">
				<div className="stages">
					<div className="stages-list">
						<InnerBlocks.Content />
					</div>
				</div>
			</div>
		</div>
	);
}

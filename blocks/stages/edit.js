import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
	const blockProps = useBlockProps( { className: 'wp-block-lazyblock-stages-big' } );

	return (
		<div { ...blockProps }>
			<div className="stages__container">
				<div className="stages">
					<div className="stages-list">
						<InnerBlocks
							allowedBlocks={ [ 'theme/stage' ] }
							template={ [ [ 'theme/stage', {} ] ] }
							templateInsertUpdatesSelection={ false }
							renderAppender={ InnerBlocks.ButtonBlockAppender }
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

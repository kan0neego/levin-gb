import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
	const blockProps = useBlockProps( { className: 'cards-number__wrapper' } );

	return (
		<div { ...blockProps }>
			<InnerBlocks
				allowedBlocks={ [ 'theme/card-number' ] }
				template={ [ [ 'theme/card-number', {} ] ] }
				templateInsertUpdatesSelection={ false }
				renderAppender={ InnerBlocks.ButtonBlockAppender }
			/>
		</div>
	);
}

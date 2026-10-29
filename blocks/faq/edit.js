import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';

export default function Edit( { clientId } ) {
	const blockProps = useBlockProps( { className: 'wp-block-lazyblock-faq' } );
	const { insertBlock } = useDispatch( blockEditorStore );

	const innerBlocksProps = useInnerBlocksProps(
		{},
		{
			allowedBlocks: [ 'theme/faq-item' ],
			template: [ [ 'theme/faq-item', {} ] ],
			templateInsertUpdatesSelection: false,
			renderAppender: () => null,
		}
	);

	const addItem = () => {
		const block = createBlock( 'theme/faq-item', {} );
		insertBlock( block, undefined, clientId );
	};

	return (
		<div { ...blockProps }>
			<div { ...innerBlocksProps } />
			<button
				type="button"
				onClick={ addItem }
				style={ {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '8px',
					width: '100%',
					padding: '12px',
					marginTop: '8px',
					background: '#313640',
					color: '#fff',
					border: 'none',
					borderRadius: '20px',
					cursor: 'pointer',
					fontSize: '16px',
					fontFamily: 'Rubik, sans-serif',
					fontWeight: '400',
				} }
			>
				+ Вопрос
			</button>
		</div>
	);
}

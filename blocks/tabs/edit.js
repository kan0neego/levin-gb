import { createBlock } from '@wordpress/blocks';
import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';

export default function Edit( { clientId } ) {
	const blockProps = useBlockProps( { className: 'containers wide mb-90' } );

	const children = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);

	const { updateBlockAttributes, insertBlock, removeBlock, selectBlock } =
		useDispatch( 'core/block-editor' );

	function activate( id ) {
		children.forEach( ( block ) => {
			updateBlockAttributes( block.clientId, { active: block.clientId === id } );
		} );
	}

	function addTab() {
		const block = createBlock( 'theme/tab-pane', { active: true } );
		children.forEach( ( b ) => {
			updateBlockAttributes( b.clientId, { active: false } );
		} );
		insertBlock( block, children.length, clientId );
		selectBlock( block.clientId );
	}

	function removeTab( id ) {
		if ( children.length <= 1 ) {
			return;
		}
		const wasActive = children.find( ( b ) => b.clientId === id ).attributes.active;
		removeBlock( id );
		if ( wasActive ) {
			const remaining = children.filter( ( b ) => b.clientId !== id );
			if ( remaining.length ) {
				updateBlockAttributes( remaining[ 0 ].clientId, { active: true } );
			}
		}
	}

	return (
		<div { ...blockProps }>
			{ /* Кнопки вкладок — рисуются родителем напрямую (без InnerBlocks),
			     поэтому ничего не ломает раскладку: читаем/пишем атрибуты детей. */ }
			<div className="tab-buttons" style={ { display: 'flex', flexWrap: 'wrap' } }>
				{ children.map( ( block ) => {
					const active = !! block.attributes.active;
					return (
						<div
							key={ block.clientId }
							className={ 'tab-n' + ( active ? ' active' : '' ) }
							onClick={ () => activate( block.clientId ) }
							style={ { cursor: 'pointer', position: 'relative' } }
						>
							<RichText
								tagName="b"
								value={ block.attributes.label }
								onChange={ ( v ) => updateBlockAttributes( block.clientId, { label: v } ) }
								placeholder="Заголовок вкладки..."
								allowedFormats={ [ 'core/bold' ] }
								onFocus={ () => activate( block.clientId ) }
							/>
							{ children.length > 1 && (
								<Button
									variant="tertiary"
									isDestructive
									label="Удалить вкладку"
									onClick={ ( e ) => {
										e.stopPropagation();
										removeTab( block.clientId );
									} }
									style={ {
										position: 'absolute',
										top: '4px',
										right: '4px',
										padding: '0 4px',
										minWidth: 'auto',
										opacity: 0.5,
										fontSize: '12px',
										lineHeight: 1,
									} }
								>
									✕
								</Button>
							) }
						</div>
					);
				} ) }
				<Button
					variant="tertiary"
					onClick={ addTab }
					className="add-tab-btn"
					label="Добавить вкладку"
				>
					+
				</Button>
			</div>
			{ /* Контент вкладок — обычный InnerBlocks, виден только активный */ }
			<div className="tab-tabs">
				<InnerBlocks
					allowedBlocks={ [ 'theme/tab-pane' ] }
					template={ [ [ 'theme/tab-pane', { active: true } ] ] }
					templateInsertUpdatesSelection={ false }
					renderAppender={ false }
				/>
			</div>
		</div>
	);
}

import { useEffect } from '@wordpress/element';
import { InnerBlocks, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { active, paneId } = attributes;

	useEffect( () => {
		if ( ! paneId ) {
			setAttributes( { paneId: 'pane-' + clientId.replace( /-/g, '' ).slice( 0, 8 ) } );
		}
	}, [] );

	// Кнопку вкладки рисует родитель (theme/tabs), здесь — только содержимое.
	// Можно свободно комбинировать текст, списки, заголовки в любом порядке.
	// Обёртка с data-type (useBlockProps) и .pane с инлайн display
	// должны быть разными элементами — иначе !important-правила
	// из editor.scss (которые форсируют display:block на [data-type=...])
	// перебивают инлайн-стиль скрытой вкладки.
	const blockProps = useBlockProps();

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'd-block fw-3' },
		{
			template: [ [ 'core/paragraph', { placeholder: 'Текст вкладки... (можно добавить списки, заголовки и другие блоки в любом порядке)' } ] ],
			templateLock: false,
		}
	);

	return (
		<div { ...blockProps }>
			<div className="pane" style={ { display: active ? 'block' : 'none' } }>
				<b { ...innerBlocksProps } />
			</div>
		</div>
	);
}

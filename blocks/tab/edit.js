import { useEffect, useRef } from '@wordpress/element';
import { InspectorControls, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { select, subscribe, useDispatch, useSelect } from '@wordpress/data';

export const PANE_TEMPLATE = [
	[ 'core/heading', { level: 3, placeholder: 'Заголовок вкладки...' } ],
	[ 'core/paragraph', { placeholder: 'Описание таба' } ],
];

function toPlain( value ) {
	return ( value || '' ).replace( /<[^>]*>/g, '' ).replace( /[\r\n]+/g, ' ' );
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { active, paneId, label, duplicateTitle } = attributes;
	const duplicate = duplicateTitle !== false;
	const applying = useRef( false );

	useEffect( () => {
		if ( ! paneId ) {
			setAttributes( { paneId: 'pane-' + clientId.replace( /-/g, '' ).slice( 0, 8 ) } );
		}
	}, [] );

	const headingId = useSelect(
		( store ) =>
			store( 'core/block-editor' )
				.getBlocks( clientId )
				.find( ( block ) => block.name === 'core/heading' )?.clientId || '',
		[ clientId ]
	);

	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	useEffect( () => {
		if ( ! duplicate || ! headingId ) {
			return undefined;
		}

		const store = select( 'core/block-editor' );
		let prevContent = store.getBlockAttributes( headingId )?.content ?? '';

		return subscribe( () => {
			const content = store.getBlockAttributes( headingId )?.content ?? '';
			if ( applying.current ) {
				prevContent = content;
				return;
			}
			if ( content === prevContent ) {
				return;
			}
			prevContent = content;
			const plain = toPlain( content );
			const current = store.getBlockAttributes( clientId )?.label ?? '';
			if ( plain !== current ) {
				applying.current = true;
				setAttributes( { label: plain } );
				applying.current = false;
			}
		} );
	}, [ duplicate, headingId, clientId, setAttributes ] );

	useEffect( () => {
		if ( ! duplicate || ! headingId ) {
			return;
		}
		const content = select( 'core/block-editor' ).getBlockAttributes( headingId )?.content ?? '';
		const next = label || '';
		if ( toPlain( content ) === next ) {
			return;
		}
		applying.current = true;
		updateBlockAttributes( headingId, { content: next } );
		applying.current = false;
	}, [ label, duplicate, headingId, updateBlockAttributes ] );

	const blockProps = useBlockProps();

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'd-block fw-3' },
		{
			template: PANE_TEMPLATE,
			templateLock: false,
		}
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title="Вкладка">
					<ToggleControl
						label="Дублировать название"
						checked={ duplicate }
						onChange={ ( value ) => setAttributes( { duplicateTitle: value } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<div className={ 'pane' + ( active ? ' is-active' : ' is-hidden' ) }>
					<b { ...innerBlocksProps } />
				</div>
			</div>
		</>
	);
}

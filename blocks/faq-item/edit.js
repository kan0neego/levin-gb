import { useState } from '@wordpress/element';
import { RichText, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Edit( { attributes, setAttributes } ) {
	const { label } = attributes;
	const [ isOpen, setIsOpen ] = useState( true );

	// accordeon_open всегда на обёртке — иначе CSS (.question:not(.accordeon_open))
	// схлопывает max-height до 0 и пропадает весь блок включая хедер.
	// Открытость в редакторе управляется только через display:none на теле.
	const blockProps = useBlockProps( {
		className: 'accordeon question load accordeon_open',
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'accordeon__content question__content' },
		{
			template: [ [ 'core/paragraph', { placeholder: 'Текст ответа... (можно добавить списки, ссылки и другие блоки в любом порядке)' } ] ],
			templateLock: false,
			renderAppender: false,
		}
	);

	return (
		<div { ...blockProps }>
			<div
				className={ 'accordeon__head question__head' + ( isOpen ? ' accordeon-editor-open' : '' ) }
				onClick={ () => setIsOpen( ( v ) => ! v ) }
				style={ { cursor: 'pointer' } }
			>
				{ /* stopPropagation чтобы клик по тексту не сворачивал аккордеон */ }
				<span onClick={ ( e ) => e.stopPropagation() }>
					<RichText
						tagName="span"
						value={ label }
						onChange={ ( value ) => setAttributes( { label: value } ) }
						placeholder="Текст вопроса..."
						allowedFormats={ [] }
						multiline={ false }
						disableLineBreaks
						onPaste={ ( { plainText, html } ) => {
							const text = plainText || html.replace( /<[^>]+>/g, '' );
							setAttributes( { label: ( label || '' ) + text.replace( /[\r\n]+/g, ' ' ).trim() } );
						} }
					/>
				</span>
			</div>
			<div
				className="accordeon__body question__body"
				style={ { display: isOpen ? 'block' : 'none' } }
			>
				<div { ...innerBlocksProps } />
			</div>
		</div>
	);
}

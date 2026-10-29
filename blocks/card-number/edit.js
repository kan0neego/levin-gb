import { RichText, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Edit( { attributes, setAttributes } ) {
	const { heading, subheading } = attributes;

	const blockProps = useBlockProps( { className: 'card-number' } );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'card-number__text-container' },
		{
			template: [ [ 'core/paragraph', { placeholder: 'Текст карточки... (можно добавить списки, заголовки и другие блоки в любом порядке)' } ] ],
			templateLock: false,
		}
	);

	const { children, ...innerProps } = innerBlocksProps;

	return (
		<div { ...blockProps }>
			<div className="card-number__order"></div>
			<div { ...innerProps }>
				<RichText
					tagName="div"
					className="card-number__heading"
					placeholder="Заголовок"
					value={ heading }
					onChange={ ( value ) => setAttributes( { heading: value } ) }
				/>
				<RichText
					tagName="div"
					className="card-number__subheading"
					placeholder="Подзаголовок"
					value={ subheading }
					onChange={ ( value ) => setAttributes( { subheading: value } ) }
				/>
				{ children }
			</div>
		</div>
	);
}

import { RichText, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Edit( { attributes, setAttributes } ) {
	const { heading } = attributes;

	const blockProps = useBlockProps( { className: 'stages-list__row' } );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'stages-list__text-container' },
		{
			template: [ [ 'core/paragraph', { placeholder: 'Текст этапа... (можно добавить списки, изображения и другие блоки)' } ] ],
			templateLock: false,
		}
	);

	return (
		<div { ...blockProps }>
			<div className="stages-list__item-heading-container">
				<RichText
					tagName="div"
					className="stages-list__item-heading"
					value={ heading }
					onChange={ ( value ) => setAttributes( { heading: value } ) }
					placeholder="Название этапа..."
					allowedFormats={ [] }
				/>
			</div>
			<div className="stages-list__item">
				<div { ...innerBlocksProps } />
			</div>
		</div>
	);
}

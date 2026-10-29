import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor';
import { PanelBody, RadioControl, ToggleControl, Button } from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
	const { columns, accentLast, headers, rows } = attributes;
	const is3 = columns === 3;

	function changeColumns( val ) {
		const n = parseInt( val, 10 );
		let h = [ ...headers ];
		if ( n === 3 && h.length < 3 ) h = [ ...h, '' ];
		if ( n === 2 && h.length > 2 ) h = h.slice( 0, 2 );

		const newRows = rows.map( ( row ) => {
			const cells = [ ...row.cells ];
			if ( n === 3 && cells.length < 3 ) cells.push( '' );
			if ( n === 2 && cells.length > 2 ) cells.length = 2;
			return { ...row, cells };
		} );

		setAttributes( { columns: n, headers: h, rows: newRows } );
	}

	function updateHeader( idx, value ) {
		const h = [ ...headers ];
		h[ idx ] = value;
		setAttributes( { headers: h } );
	}

	function updateCriterion( rowIdx, value ) {
		setAttributes( {
			rows: rows.map( ( row, i ) =>
				i === rowIdx ? { ...row, criterion: value } : row
			),
		} );
	}

	function updateCell( rowIdx, cellIdx, value ) {
		setAttributes( {
			rows: rows.map( ( row, i ) => {
				if ( i !== rowIdx ) return row;
				const cells = [ ...row.cells ];
				cells[ cellIdx ] = value;
				return { ...row, cells };
			} ),
		} );
	}

	function addRow() {
		const emptyCells = Array( columns ).fill( '' );
		setAttributes( { rows: [ ...rows, { criterion: '', cells: emptyCells } ] } );
	}

	function removeRow( idx ) {
		setAttributes( { rows: rows.filter( ( _, i ) => i !== idx ) } );
	}

	const blockProps = useBlockProps( { className: 'pros-table-editor' } );
	const lastCellIdx = columns - 1;

	return (
		<>
			<InspectorControls>
				<PanelBody title="Настройки">
					<RadioControl
						label="Колонки"
						selected={ String( columns ) }
						options={ [
							{ label: '2 колонки', value: '2' },
							{ label: '3 колонки', value: '3' },
						] }
						onChange={ changeColumns }
					/>
					<ToggleControl
						label="Чек-лист в последней колонке"
						checked={ accentLast }
						onChange={ ( v ) => setAttributes( { accentLast: v } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<table className={ `pros-table${ is3 ? ' pros-table-three' : '' }` }>
					<thead className="pros-table__head">
						<tr className="pros-table__row">
							{ headers.slice( 0, columns ).map( ( h, idx ) => (
								<td key={ idx } className="pros-table__cell">
									<RichText
										className="pros-rt-header"
										value={ h || '' }
										onChange={ ( v ) => updateHeader( idx, v ) }
										placeholder={ `Заголовок ${ idx + 1 }` }
									/>
								</td>
							) ) }
						</tr>
					</thead>
					<tbody className="pros-table__body">
						{ rows.map( ( row, rowIdx ) => (
							<tr key={ rowIdx } className="pros-table__row">
								{ ( row.cells || [] ).slice( 0, columns ).map( ( cell, cellIdx ) => {
									const isLast = cellIdx === lastCellIdx;
									const cellContent = (
										<>
											<RichText
												tagName="span"
												className="pros-rt-criterion"
												value={ row.criterion || '' }
												onChange={ ( v ) => updateCriterion( rowIdx, v ) }
												placeholder="Критерий"
											/>
											<RichText
												className="pros-rt-content"
												value={ cell || '' }
												onChange={ ( v ) => updateCell( rowIdx, cellIdx, v ) }
												placeholder="Текст ячейки"
											/>
										</>
									);
									return (
										<td key={ cellIdx } className="pros-table__cell">
											{ isLast && accentLast ? (
												<>
													<RichText
														tagName="span"
														className="pros-rt-criterion"
														value={ row.criterion || '' }
														onChange={ ( v ) => updateCriterion( rowIdx, v ) }
														placeholder="Критерий"
													/>
													<div className="pros-table__icon">
														<i />
														<RichText
															className="pros-rt-content"
															value={ cell || '' }
															onChange={ ( v ) => updateCell( rowIdx, cellIdx, v ) }
															placeholder="Текст ячейки"
														/>
													</div>
												</>
											) : cellContent }
										</td>
									);
								} ) }

								<td className="pros-table-editor__ctrl-col">
									{ rows.length > 1 && (
										<Button
											isDestructive
											icon="no-alt"
											label="Удалить строку"
											onClick={ () => removeRow( rowIdx ) }
										/>
									) }
								</td>
							</tr>
						) ) }
					</tbody>
				</table>

				<Button
					variant="secondary"
					className="pros-table-editor__add"
					onClick={ addRow }
				>
					+ Добавить строку
				</Button>
			</div>
		</>
	);
}

import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const { columns, accentLast, headers, rows } = attributes;
	const is3 = columns === 3;
	const lastCellIdx = columns - 1;

	const table = (
		<table className={ `pros-table${ is3 ? ' pros-table-three' : '' }` }>
			<thead className="pros-table__head">
				<tr className="pros-table__row">
					{ headers.slice( 0, columns ).map( ( h, idx ) => (
						<td key={ idx } className="pros-table__cell">
							<RichText.Content value={ h || '' } />
						</td>
					) ) }
				</tr>
			</thead>
			<tbody className="pros-table__body">
				{ rows.map( ( row, rowIdx ) => (
					<tr key={ rowIdx } className="pros-table__row">
						{ ( row.cells || [] ).slice( 0, columns ).map( ( cell, cellIdx ) => {
							const isLast = cellIdx === lastCellIdx;
							return (
								<td key={ cellIdx } className="pros-table__cell">
									<RichText.Content tagName="span" value={ row.criterion || '' } />
									{ isLast && accentLast ? (
										<div className="pros-table__icon">
											<i></i>
											<RichText.Content value={ cell || '' } />
										</div>
									) : (
										<RichText.Content value={ cell || '' } />
									) }
								</td>
							);
						} ) }
					</tr>
				) ) }
			</tbody>
		</table>
	);

	return (
		<div { ...useBlockProps.save() }>
			{ is3 ? <div className="pros-table-wrap">{ table }</div> : table }
		</div>
	);
}

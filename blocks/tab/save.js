import { InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { label, active, paneId: rawPaneId } = attributes;
	const paneId = rawPaneId || 'pane-default';
	const activeClass = active ? ' active' : '';

	return (
		<>
			<a href={ '#' + paneId } className={ 'tab-n' + activeClass } aria-controls={ paneId }>
				<b>{ label }</b>
			</a>
			<div className="pane" id={ paneId }>
				<b className="d-block fw-3">
					<InnerBlocks.Content />
				</b>
			</div>
		</>
	);
}

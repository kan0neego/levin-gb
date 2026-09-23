<?php
/**
 * Server-side rendering for the theme/case-list block.
 *
 * @package theme
 */

$case_id = isset( $attributes['caseId'] ) ? $attributes['caseId'] : 0;
$html    = render_case_card( $case_id );


if ( '' === $html ) {
	printf(
		'<div class="case-card case-card--empty">%s</div>',
		esc_html__( 'Кейс не выбран или недоступен', 'theme' )
	);
	return;
}

echo $html; // phpcs:ignore.

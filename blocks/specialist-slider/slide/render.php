<?php
/**
 * Server-side rendering for the theme/specialist-slide block.
 *
 * @package theme
 */

$doctor_id = isset( $attributes['doctorId'] ) ? $attributes['doctorId'] : 0;
$html      = function_exists( 'render_specialist_slide' ) ? render_specialist_slide( $doctor_id ) : '';

if ( '' === $html ) {
	printf(
		'<div class="banner-specialist banner-specialist--empty">%s</div>',
		esc_html__( 'Врач не выбран или недоступен', 'theme' )
	);
	return;
}

echo $html; // phpcs:ignore.

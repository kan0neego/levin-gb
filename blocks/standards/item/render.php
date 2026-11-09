<?php
/**
 * Server-side rendering for the theme/standard-item block.
 *
 * @package theme
 */

$standard_id = isset( $attributes['standardId'] ) ? absint( $attributes['standardId'] ) : 0;
$title       = isset( $attributes['title'] ) ? wp_kses( $attributes['title'], array( 'strong' => array() ) ) : '';
$subtitle    = isset( $attributes['subtitle'] ) ? wp_kses( $attributes['subtitle'], array() ) : '';
$items       = isset( $attributes['items'] ) ? (array) $attributes['items'] : array();
$items       = array_filter(
	array_map(
		static function ( $item ) {
			return trim( wp_kses( (string) $item, array() ) );
		},
		$items
	),
	'strlen'
);

if ( '' === trim( wp_strip_all_tags( $title ) ) ) {
	return;
}

$image    = $standard_id && function_exists( 'get_field' ) ? get_field( 'standard-image', $standard_id ) : null;
$image_id = is_array( $image ) && ! empty( $image['ID'] ) ? absint( $image['ID'] ) : 0;
?>

<div class="row row_center row_sm_center">
	<div class="col col-sm-5">
		<?php
		if ( $image_id ) {
			echo wp_get_attachment_image(
				$image_id,
				'full',
				false,
				array(
					'class' => 'd-block mx-auto',
					'alt'   => wp_strip_all_tags( $title ),
				)
			);
		}
		?>
	</div>
	<div class="col col-sm-7">
		<h3 class="heading heading_h2"><?php echo $title; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></h3>
		<?php if ( '' !== $subtitle ) : ?>
			<p class="text text_medium"><?php echo $subtitle; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
		<?php endif; ?>
		<?php if ( $items ) : ?>
			<ul class="wp-block-list">
				<?php foreach ( $items as $item ) : ?>
					<li><?php echo $item; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></li>
				<?php endforeach; ?>
			</ul>
		<?php endif; ?>
	</div>
</div>

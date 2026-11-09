<?php
/**
 * Server-side rendering for the theme/tab block.
 *
 * @package theme
 */

$tab_id          = isset( $attributes['id'] ) ? (string) $attributes['id'] : '';
$tab_label       = isset( $attributes['label'] ) ? (string) $attributes['label'] : '';
$duplicate_title = ! isset( $block->context['theme/duplicateTitle'] ) || $block->context['theme/duplicateTitle'];
$inner_html = '';

if ( isset( $block->inner_blocks ) ) {
	foreach ( $block->inner_blocks as $inner_block ) {
		$inner_html .= $inner_block->render();
	}
}

$wrapper_attributes = array(
	'class' => 'tab-content-item',
);

if ( '' !== $tab_id ) {
	$wrapper_attributes['id'] = $tab_id;
}
?>
<div <?php echo get_block_wrapper_attributes( $wrapper_attributes ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="tab-item__wrapper">
		<div class="prose">
			<?php if ( $duplicate_title && '' !== $tab_label ) : ?>
				<h3><?php echo wp_kses_post( $tab_label ); ?></h3>
			<?php endif; ?>
			<?php echo $inner_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
	</div>
</div>

<?php
/**
 * Server-side rendering for the theme/tabs block.
 *
 * @package theme
 */

$tabs = array();

if ( isset( $block->inner_blocks ) ) {
	foreach ( $block->inner_blocks as $inner_block ) {
		if ( 'theme/tab' !== $inner_block->name ) {
			continue;
		}

		$tabs[] = $inner_block;
	}
}

if ( ! $tabs ) {
	return;
}
?>
<div <?php echo get_block_wrapper_attributes( array( 'class' => 'tabs-block' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="tab-buttons">
		<?php foreach ( $tabs as $index => $tab ) : ?>
			<?php
			$tab_id    = isset( $tab->attributes['id'] ) ? (string) $tab->attributes['id'] : '';
			$tab_label = isset( $tab->attributes['label'] ) ? (string) $tab->attributes['label'] : '';
			$classes   = 'tab-button';

			if ( 0 === $index ) {
				$classes .= ' active';
			}
			?>
			<button type="button" data-tab="<?php echo esc_attr( $tab_id ); ?>" class="<?php echo esc_attr( $classes ); ?>">
				<?php echo wp_kses_post( $tab_label ); ?>
			</button>
		<?php endforeach; ?>
	</div>
	<div class="tab-tabs">
		<?php foreach ( $tabs as $tab ) : ?>
			<?php echo $tab->render(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php endforeach; ?>
	</div>
</div>

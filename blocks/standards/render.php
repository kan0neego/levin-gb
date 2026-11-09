<?php
/**
 * Server-side rendering for the theme/standards block.
 *
 * @package theme
 */

if ( '' === trim( $content ) ) {
	return;
}

// Каждый чётный стандарт идёт с картинкой справа.
$items = new WP_HTML_Tag_Processor( $content );
$index = 0;

while ( $items->next_tag( array( 'class_name' => 'row' ) ) ) {
	++$index;

	if ( 0 === $index % 2 ) {
		$items->add_class( 'reverse' );
	}
}
?>

<div <?php echo get_block_wrapper_attributes( array( 'class' => 'standards' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php echo $items->get_updated_html(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</div>

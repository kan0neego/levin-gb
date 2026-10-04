<?php
/**
 * Server-side rendering for the theme/video block.
 *
 * @package theme
 */

$id      = isset( $attributes['id'] ) ? absint( $attributes['id'] ) : 0;
$url     = isset( $attributes['url'] ) ? $attributes['url'] : '';
$caption = isset( $attributes['caption'] ) ? $attributes['caption'] : '';

// Предпочитаем вложение: даёт актуальный URL даже если сохранённый устарел.
if ( $id > 0 ) {
	$attachment_url = wp_get_attachment_url( $id );
	if ( $attachment_url ) {
		$url = $attachment_url;
	}
}

if ( '' === $url ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'     => 'wp-block-video video-autoplay video-lightbox',
		'data-type' => 'video',
	)
);
?>
<figure <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<img class="video-poster" alt="" />
	<video class="video-content" muted loop playsinline>
		<source data-src="<?php echo esc_url( $url ); ?>" type="video/mp4" />
	</video>
	<?php if ( '' !== $caption ) : ?>
		<figcaption><?php echo wp_kses_post( $caption ); ?></figcaption>
	<?php endif; ?>
</figure>

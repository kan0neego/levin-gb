<?php
/**
 * Server-side rendering for the theme/video block.
 *
 * @package theme
 */

$id         = isset( $attributes['id'] ) ? absint( $attributes['id'] ) : 0;
$url        = isset( $attributes['url'] ) ? $attributes['url'] : '';
$preview    = isset( $attributes['preview'] ) ? $attributes['preview'] : '';
$preview_id = isset( $attributes['previewId'] ) ? absint( $attributes['previewId'] ) : 0;
$mime_type  = isset( $attributes['mimeType'] ) ? $attributes['mimeType'] : '';
$poster_id  = isset( $attributes['posterId'] ) ? absint( $attributes['posterId'] ) : 0;
$play_mode  = isset( $attributes['playMode'] ) ? $attributes['playMode'] : 'autoplay';
$caption    = isset( $attributes['caption'] ) ? $attributes['caption'] : '';

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

// Инлайновое превью-видео: вложение имеет приоритет над ссылкой.
if ( $preview_id > 0 ) {
	$preview_attachment_url = wp_get_attachment_url( $preview_id );
	if ( $preview_attachment_url ) {
		$preview = $preview_attachment_url;
	}
}

$poster = wp_get_attachment_image( $poster_id, 'full', false, array( 'class' => 'video-poster' ) );

$is_direct = (bool) preg_match( '/\.(mp4|webm|ogv|ogg|mov)(\?.*)?$/i', $url );

if ( '' === $mime_type ) {
	$mime_types = array(
		'mp4'  => 'video/mp4',
		'webm' => 'video/webm',
		'ogv'  => 'video/ogg',
		'ogg'  => 'video/ogg',
		'mov'  => 'video/quicktime',
	);
	$mime_type  = 'video/mp4';
	if ( preg_match( '/\.([^.\/?#]+)(?:\?.*)?$/', $source_url, $matches ) ) {
		$extension = strtolower( $matches[1] );
		if ( isset( $mime_types[ $extension ] ) ) {
			$mime_type = $mime_types[ $extension ];
		}
	}
}

$classes = 'vid-block wp-block-video video-lightbox';
if ( $is_direct ) {
	$classes .= ' video-autoplay';
}

$wrapper_attributes = get_block_wrapper_attributes(
	array_merge(
		array(
			'class'         => $classes,
			'data-src'      => $url,
			'data-fancybox' => '',
		),
		$is_direct ? array( 'data-play-mode' => $play_mode ) : array( 'data-type' => 'iframe' )
	)
);
?>

<figure <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<img class="video-poster" src="<?php echo esc_url( $poster ); ?>" alt="" />
	<?php if ( $is_direct && '' !== $preview ) : ?>
		<video class="video-content" muted loop playsinline>
			<source data-src="<?php echo esc_url( $source_url ); ?>" type="<?php echo esc_attr( $mime_type ); ?>" />
		</video>
	<?php endif; ?>
	<?php if ( '' !== $caption ) : ?>
		<figcaption class="video-caption"><?php echo wp_kses_post( $caption ); ?></figcaption>
	<?php endif; ?>
	<div class="video-play">
		<img decoding="async" class="video-play__image" src="https://doctorlevin.ru/wp-content/themes/sd-03-2_new/static/img/video-play-button.svg" alt="">
	</div>
</figure>


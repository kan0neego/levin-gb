<?php
/**
 * Server-side rendering for the theme/video block.
 *
 * @package theme
 */

$id        = isset( $attributes['id'] ) ? absint( $attributes['id'] ) : 0;
$url       = isset( $attributes['url'] ) ? $attributes['url'] : '';
$mime_type = isset( $attributes['mimeType'] ) ? $attributes['mimeType'] : '';
$poster_id = isset( $attributes['posterId'] ) ? absint( $attributes['posterId'] ) : 0;
$poster    = isset( $attributes['poster'] ) ? $attributes['poster'] : '';
$play_mode = isset( $attributes['playMode'] ) ? $attributes['playMode'] : 'autoplay';
$caption   = isset( $attributes['caption'] ) ? $attributes['caption'] : '';

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

// Постер: предпочитаем вложение.
if ( $poster_id > 0 ) {
	$poster_url = wp_get_attachment_image_url( $poster_id, 'full' );
	if ( $poster_url ) {
		$poster = $poster_url;
	}
}

// Прямая ссылка на файл рендерится в <video>, внешний источник — во фрейме.
$is_direct = (bool) preg_match( '/\.(mp4|webm|ogv|ogg|mov)(\?.*)?$/i', $url );

// MIME-тип берём из атрибутов, сохранённых при выборе видео в редакторе.
// Парсинг расширения — только fallback для блоков, сохранённых до появления атрибута.
if ( '' === $mime_type ) {
	$mime_types = array(
		'mp4'  => 'video/mp4',
		'webm' => 'video/webm',
		'ogv'  => 'video/ogg',
		'ogg'  => 'video/ogg',
		'mov'  => 'video/quicktime',
	);
	$mime_type  = 'video/mp4';
	if ( preg_match( '/\.([^.\/?#]+)(?:\?.*)?$/', $url, $matches ) ) {
		$extension = strtolower( $matches[1] );
		if ( isset( $mime_types[ $extension ] ) ) {
			$mime_type = $mime_types[ $extension ];
		}
	}
}

$classes = 'wp-block-video video-lightbox';
if ( $is_direct ) {
	$classes .= ' video-autoplay';
}

$wrapper_attributes = get_block_wrapper_attributes(
	array_merge(
		array(
			'class'         => $classes,
			'data-src'      => $url,
			'data-lightbox' => '',
		),
		$is_direct ? array( 'data-play-mode' => $play_mode ) : array( 'data-type' => 'iframe' )
	)
);
?>

<figure <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<img class="video-poster" src="<?php echo esc_url( $poster ); ?>" alt="" />
	<?php if ( $is_direct ) : ?>
		<video class="video-content" muted loop playsinline>
			<source data-src="<?php echo esc_url( $url ); ?>" type="<?php echo esc_attr( $mime_type ); ?>" />
		</video>
	<?php endif; ?>
	<?php if ( '' !== $caption ) : ?>
		<figcaption><?php echo wp_kses_post( $caption ); ?></figcaption>
	<?php endif; ?>
</figure>


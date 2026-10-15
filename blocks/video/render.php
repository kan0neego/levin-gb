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
$width      = isset( $attributes['width'] ) ? absint( $attributes['width'] ) : 0;
$height     = isset( $attributes['height'] ) ? absint( $attributes['height'] ) : 0;

// Предпочитаем вложение: даёт актуальный URL даже если сохранённый устарел.
if ( $id > 0 ) {
	$attachment_url = wp_get_attachment_url( $id );
	if ( $attachment_url ) {
		$url = $attachment_url;
	}
}

if ( $preview_id > 0 ) {
	$preview_attachment_url = wp_get_attachment_url( $preview_id );
	if ( $preview_attachment_url ) {
		$preview = $preview_attachment_url;
	}
}

$has_preview = '' !== $preview;

if ( '' === $url && ! $has_preview ) {
	return;
}

// Прямая ссылка на видеофайл открывается во встроенном плеере, всё остальное (YouTube, Vimeo и т.п.) — во фрейме.
$is_direct = (bool) preg_match( '/\.(mp4|webm|ogv|ogg|mov)(\?.*)?$/i', $url );

// Фон: превью без фрейма, либо устаревший флаг isBackground с источником в url.
if ( '' === $url ) {
	$is_background = $has_preview;
} else {
	$is_background = ! empty( $attributes['isBackground'] ) && $is_direct && ! $has_preview;
}

// Фоновое видео: автовоспроизведение без обложки и lightbox проигрывателя.
if ( $is_background ) {
	$background_src = $has_preview ? $preview : $url;
	$background_id  = $has_preview ? $preview_id : $id;

	if ( ( ! $width || ! $height ) && $background_id > 0 ) {
		$metadata = wp_get_attachment_metadata( $background_id );
		$width    = isset( $metadata['width'] ) ? absint( $metadata['width'] ) : 0;
		$height   = isset( $metadata['height'] ) ? absint( $metadata['height'] ) : 0;
	}

	$has_dimensions     = $width > 0 && $height > 0;
	$background_class   = 'vid-block wp-block-video video-background';
	if ( '' !== $caption ) {
		$background_class .= ' has-caption';
	}
	$wrapper_attributes = get_block_wrapper_attributes(
		array( 'class' => $background_class )
	);
	?>

<figure <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<video
		class="video-content"
		src="<?php echo esc_url( $background_src ); ?>"
		<?php if ( $has_dimensions ) : ?>
			width="<?php echo esc_attr( $width ); ?>"
			height="<?php echo esc_attr( $height ); ?>"
			style="aspect-ratio: <?php echo esc_attr( $width . ' / ' . $height ); ?>"
		<?php endif; ?>
		autoplay muted loop playsinline
	></video>
	<div class="video-progress" aria-hidden="true">
		<div class="video-progress__bar"></div>
	</div>
	<?php if ( '' !== $caption ) : ?>
		<figcaption class="video-caption"><?php echo wp_kses_post( $caption ); ?></figcaption>
	<?php endif; ?>
</figure>

	<?php
	return;
}

$poster = wp_get_attachment_image( $poster_id, 'full', false, array( 'class' => 'video-poster', 'srcset' => " " ) );

if ( '' === $mime_type ) {
	$mime_types = array(
		'mp4'  => 'video/mp4',
		'webm' => 'video/webm',
		'ogv'  => 'video/ogg',
		'ogg'  => 'video/ogg',
		'mov'  => 'video/quicktime',
	);
	$mime_type  = 'video/mp4';
	if ( preg_match( '/\.([^.\/?#]+)(?:\?.*)?$/', $preview, $matches ) ) {
		$extension = strtolower( $matches[1] );
		if ( isset( $mime_types[ $extension ] ) ) {
			$mime_type = $mime_types[ $extension ];
		}
	}
}

$classes = 'vid-block wp-block-video video-lightbox';
if ( $has_preview ) {
	$classes .= ' video-autoplay';
}
if ( '' !== $caption ) {
	$classes .= ' has-caption';
}

$wrapper_attributes = get_block_wrapper_attributes(
	array_merge(
		array(
			'class'         => $classes,
			'data-src'      => $url,
			'data-fancybox' => '',
			'data-play-mode' => $play_mode
		),
		$is_direct ? array() : array( 'data-type' => 'iframe' ),
	)
);
?>

<figure <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php echo $poster ?>
	<?php if ( $has_preview ) : ?>
		<video class="video-content" muted loop playsinline>
			<source data-src="<?php echo esc_url( $preview ); ?>" type="<?php echo esc_attr( $mime_type ); ?>" />
		</video>
	<?php endif; ?>
	<?php if ( '' !== $caption ) : ?>
		<figcaption class="video-caption"><?php echo wp_kses_post( $caption ); ?></figcaption>
	<?php endif; ?>
	<div class="video-play">
		<img decoding="async" class="video-play__image" src="https://doctorlevin.ru/wp-content/themes/sd-03-2_new/static/img/video-play-button.svg" alt="">
	</div>
</figure>

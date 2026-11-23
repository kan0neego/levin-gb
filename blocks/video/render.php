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
$poster_url = isset( $attributes['poster'] ) ? (string) $attributes['poster'] : '';
$play_mode  = isset( $attributes['playMode'] ) ? $attributes['playMode'] : 'autoplay';
$caption    = isset( $attributes['caption'] ) ? $attributes['caption'] : '';
$video_id   = isset( $attributes['videoId'] ) ? absint( $attributes['videoId'] ) : 0;
$saved_id   = $id;
$saved_url  = (string) $url;

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
$is_direct   = (bool) preg_match( '/\.(mp4|webm|ogv|ogg|mov)(\?.*)?$/i', $url );

// Устаревший флаг: источник фона лежал в url.
// Редактор переписывает это в preview при открытии поста (deprecated.jsx).
// Здесь то же правило, пока запись не сохранили заново.
if ( ! $has_preview && '' !== $url && ! empty( $attributes['isBackground'] ) && $is_direct ) {
    $preview     = $url;
    $has_preview = true;
    $url         = '';
}

// videoId подставляет обложку (video_poster), превью (video_videocover)
// и ссылку только в пустые поля.
// Ссылка записи: файл video_file, иначе внешний video_url.
// Свои poster/posterId, preview/previewId и url/id не заменяются. См. video-id-media.js.
$cover_empty   = $poster_id <= 0 && '' === trim( $poster_url );
$preview_empty = $preview_id <= 0 && '' === trim( (string) $preview );
$link_empty    = $saved_id <= 0 && '' === trim( $saved_url );

if ( $video_id > 0 && ( $cover_empty || $preview_empty || $link_empty ) ) {
    $video_post = get_post( $video_id );

    if ( $video_post instanceof WP_Post && 'videos' === $video_post->post_type ) {
        if ( $cover_empty ) {
            $poster_meta = get_post_meta( $video_id, 'video_poster', true );

            if ( is_array( $poster_meta ) ) {
                $poster_meta = $poster_meta['ID'] ?? ( $poster_meta['id'] ?? 0 );
            }

            $poster_id = absint( $poster_meta );
        }

        if ( $preview_empty ) {
            $preview_meta = get_post_meta( $video_id, 'video_videocover', true );

            if ( is_array( $preview_meta ) ) {
                $preview_meta = $preview_meta['ID'] ?? ( $preview_meta['id'] ?? 0 );
            }

            $preview_id = absint( $preview_meta );

            if ( $preview_id > 0 ) {
                $preview_attachment_url = wp_get_attachment_url( $preview_id );

                if ( $preview_attachment_url ) {
                    $preview     = (string) $preview_attachment_url;
                    $has_preview = true;
                }
            }
        }

        if ( $link_empty ) {
            $file_meta = get_post_meta( $video_id, 'video_file', true );

            if ( is_array( $file_meta ) ) {
                $file_meta = $file_meta['ID'] ?? ( $file_meta['id'] ?? 0 );
            }

            $file_id = absint( $file_meta );

            if ( $file_id > 0 ) {
                $id             = $file_id;
                $attachment_url = wp_get_attachment_url( $file_id );
                $url            = $attachment_url ? (string) $attachment_url : '';
            } else {
                $external = get_post_meta( $video_id, 'video_url', true );
                $external = is_string( $external ) ? trim( $external ) : '';
                $url      = function_exists( 'levin_video_embed_url' )
                    ? levin_video_embed_url( $external )
                    : $external;
            }
        }
    }
}

if ( '' === $url && ! $has_preview ) {
    return;
}

$is_direct = (bool) preg_match( '/\.(mp4|webm|ogv|ogg|mov)(\?.*)?$/i', $url );
$poster = wp_get_attachment_image( $poster_id, 'full', false, array( 'class' => 'video-poster', 'srcset' => ' ' ) );

if ( ! $poster && '' !== trim( $poster_url ) ) {
    $poster = '<img class="video-poster" alt="" src="' . esc_url( $poster_url ) . '" />';
}

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

$classes = 'vid-block wp-block-video';
if ( $has_preview ) {
    $classes .= ' video-autoplay';
}
if ( '' !== $url ) {
    $classes .= ' video-lightbox';
}
if ( '' !== $caption ) {
    $classes .= ' has-caption';
}

$wrapper_attributes = get_block_wrapper_attributes(
    array_merge(
        array(
            'class'          => $classes,
            'data-play-mode' => $play_mode,
        ),
        '' !== $url
            ? array_merge(
                array(
                    'data-src'      => $url,
                    'data-fancybox' => '',
                ),
                $is_direct ? array() : array( 'data-type' => 'iframe' )
            )
            : array()
    )
);
?>

<figure <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <?php echo $poster; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    <?php if ( $has_preview ) : ?>
        <video class="video-content" muted loop playsinline>
            <source data-src="<?php echo esc_url( $preview ); ?>" type="<?php echo esc_attr( $mime_type ); ?>" />
        </video>
        <div class="video-progress" aria-hidden="true"></div>
    <?php endif; ?>
    <?php if ( '' !== $caption ) : ?>
        <figcaption class="video-caption"><?php echo wp_kses_post( $caption ); ?></figcaption>
    <?php endif; ?>
    <?php if ( '' !== $url ) : ?>
        <div class="video-play">
            <img decoding="async" class="video-play__image" src="https://doctorlevin.ru/wp-content/themes/sd-03-2_new/static/img/video-play-button.svg" alt="">
        </div>
    <?php endif; ?>
</figure>

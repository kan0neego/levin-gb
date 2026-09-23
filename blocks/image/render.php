<?php
/**
 * Server-side rendering for the theme/image block.
 *
 * @package theme
 */

if ( ! function_exists( 'theme_render_image_img' ) ) {
	/**
	 * Render the <img> for a media item.
	 *
	 * Prefers the attachment (native srcset/sizes), falls back to the
	 * attributes saved in the block when the attachment is unavailable.
	 *
	 * @param array $item Media item: { id, url, alt, sizes, caption }.
	 * @return string
	 */
	function theme_render_image_img( $item ) {
		$id  = isset( $item['id'] ) ? (int) $item['id'] : 0;
		$alt = isset( $item['alt'] ) ? $item['alt'] : '';

		if ( $id > 0 ) {
			$img = wp_get_attachment_image(
				$id,
				'full',
				false,
				array(
					'alt'      => $alt,
					'loading'  => 'lazy',
					'decoding' => 'async',
				)
			);

			if ( $img ) {
				return $img;
			}
		}

		// Fallback: rebuild the markup from the saved attributes.
		$sizes = isset( $item['sizes'] ) && is_array( $item['sizes'] ) ? $item['sizes'] : array();
		$full  = isset( $sizes['full'] ) && is_array( $sizes['full'] ) ? $sizes['full'] : array();

		$src = ! empty( $item['url'] )
			? $item['url']
			: ( ! empty( $full['url'] ) ? $full['url'] : '' );

		if ( '' === $src ) {
			return '';
		}

		$attrs = array(
			'src'      => $src,
			'alt'      => $alt,
			'loading'  => 'lazy',
			'decoding' => 'async',
		);

		$width  = isset( $full['width'] ) ? (int) $full['width'] : 0;
		$height = isset( $full['height'] ) ? (int) $full['height'] : 0;

		if ( $width > 0 ) {
			$attrs['width'] = $width;
		}

		if ( $height > 0 ) {
			$attrs['height'] = $height;
		}

		$srcset = array();
		foreach ( $sizes as $size ) {
			if ( is_array( $size ) && ! empty( $size['url'] ) && ! empty( $size['width'] ) ) {
				$srcset[] = $size['url'] . ' ' . (int) $size['width'] . 'w';
			}
		}

		if ( $srcset ) {
			$attrs['srcset'] = implode( ', ', $srcset );

			if ( $width > 0 ) {
				$attrs['sizes'] = sprintf( 'auto, (max-width: %dpx) 100vw, %dpx', $width, $width );
			}
		}

		$html = '<img';
		foreach ( $attrs as $name => $value ) {
			$html .= sprintf( ' %s="%s"', esc_attr( $name ), esc_attr( $value ) );
		}
		$html .= ' />';

		return $html;
	}
}

if ( ! function_exists( 'theme_render_image_figure' ) ) {
	/**
	 * Render a <figure class="wp-block-image bg-filter"> for a media item.
	 *
	 * @param array $item Media item.
	 * @return string
	 */
	function theme_render_image_figure( $item, $is_single = true ) {
		$sizes   = isset( $item['sizes'] ) && is_array( $item['sizes'] ) ? $item['sizes'] : array();
		$full    = isset( $sizes['full'] ) && is_array( $sizes['full'] ) ? $sizes['full'] : array();
		$caption = isset( $item['caption'] ) ? $item['caption'] : '';
		$bg_url  = $item['url'];

		$style = '' !== $bg_url ? sprintf( ' style="--img-url: url(%s)"', esc_url( $bg_url ) ) : '';

		$html  = sprintf( '<figure class="wp-block-image bg-filter"%s>', $style );
		$html .= '<picture>';
		$html .= theme_render_image_img( $item );
		$html .= '</picture>';

		if ( '' !== $caption && $is_single ) {
			$html .= sprintf( '<figcaption>%s</figcaption>', wp_kses_post( $caption ) );
		}

		$html .= '</figure>';

		return $html;
	}
}

$media = isset( $attributes['media'] ) && is_array( $attributes['media'] ) ? $attributes['media'] : array();

// Keep only items with a resolvable image source.
$media = array_values(
	array_filter(
		$media,
		static function ( $item ) {
			return is_array( $item )
				&& ( ! empty( $item['url'] ) || ! empty( $item['id'] ) || ! empty( $item['sizes'] ) );
		}
	)
);

if ( empty( $media ) ) {
	return;
}

// Single image.
if ( 1 === count( $media ) ) {
	?>
		<div <?php echo get_block_wrapper_attributes(); //phpcs:ignore ?>>
			<?php echo theme_render_image_figure( $media[0] ); // phpcs:ignore ?>
		</div>
	<?php
	return;
}

// Gallery (media slider).
$first_caption = isset( $media[0]['caption'] ) ? $media[0]['caption'] : '';
?>
<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore ?>>
	<div class="media-slider">
		<div class="slider-container" data-option="media" data-per-view="1">
			<div class="swiper-wrapper">
				<?php foreach ( $media as $item ) : ?>
					<div class="swiper-slide" data-caption="<?php echo esc_attr( isset( $item['caption'] ) ? $item['caption'] : '' ); ?>">
						<?php echo theme_render_image_figure( $item, false ); // phpcs:ignore ?>
					</div>
				<?php endforeach; ?>
			</div>
			<div class="line-pagination line-pagination-overflow"></div>
			<button type="button" class="btn-slider btn-slider-prev" data-button="prev" aria-label="<?php esc_attr_e( 'Предыдущий слайд', 'theme' ); ?>">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 9 16"
					fill="none"
				>
					<path
						d="M0.999999 14.2063L7.60316 7.60316L1 1"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
			<button type="button" class="btn-slider btn-slider-next" data-button="next" aria-label="<?php esc_attr_e( 'Следующий слайд', 'theme' ); ?>">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 9 16"
					fill="none"
				>
					<path
						d="M0.999999 14.2063L7.60316 7.60316L1 1"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
		</div>
		<div class="swiper-caption">
			<div class="swiper-caption-content">
				<div class="swiper-caption-text"><?php echo esc_html( $first_caption ); ?></div>
			</div>
		</div>
	</div>
</div>


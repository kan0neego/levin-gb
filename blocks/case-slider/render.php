<?php
/**
 * Server-side rendering for the theme/case-slider block.
 *
 * @package theme
 */

$slides = array();

if ( function_exists( 'render_case_card' ) ) {
	foreach ( $attributes['slides'] as $slide ) {
		if ( ! is_array( $slide ) || empty( $slide['caseId'] ) ) {
			continue;
		}

		$card = render_case_card( $slide['caseId'] );

		if ( '' !== $card ) {
			$slides[] = $card;
		}
	}
}

if ( empty( $slides ) ) {
	return;
}
?>

<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore ?>>
	<div class="case-slider">
		<div class="slider-container" data-option="cases" data-per-view="1">
			<div class="swiper-wrapper">
				<?php foreach ( $slides as $card ) : ?>
					<div class="swiper-slide">
						<?php echo $card; // phpcs:ignore ?>
					</div>
				<?php endforeach; ?>
			</div>
			<div class="line-pagination"></div>
			<div class="swiper-navigation">
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
		</div>
	</div>
</div>


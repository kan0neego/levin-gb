<?php
/**
 * Server-side rendering for the theme/specialist-slider block.
 *
 * @package theme
 */

$slides = array();
$thumbs = array();

if ( function_exists( 'render_specialist_slide' ) ) {
	foreach ( $attributes['slides'] as $slide ) {
		if ( ! is_array( $slide ) || empty( $slide['doctorId'] ) ) {
			continue;
		}

		$rendered_slide = render_specialist_slide( $slide['doctorId'] );

		if ( '' !== $rendered_slide ) {
			$slides[] = $rendered_slide;
			$thumbs[] = $slide;
		}
	}
}

if ( empty( $slides ) ) {
	return;
}

?>

<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore ?>>
	<div class="specialist-slider-wrapper">
		<div class="specialist-slider">
			<div class="slider-container" data-option="specialist" data-thumb="specialist-thumb"  data-per-view="1">
				<div class="swiper-wrapper">
					<?php foreach ( $slides as $rendered_slide ) : ?>
						<div class="swiper-slide">
							<?php echo $rendered_slide; // phpcs:ignore ?>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
			<div class="specialist-thumb-slider">
				<div
					class="slider-container specialist-thumb"
					data-option="specialist-thumb"
					data-lg-slides-per-view='3'
					data-xl-slides-per-view='4'
				>
					<div class="swiper-wrapper">
						<?php
						foreach ( $thumbs as $thumb ) :
								$params = array( 'post_id' => $thumb['doctorId'] );
							?>
								<div class="swiper-slide">
									<?php
										get_template_part(
											'template-parts/sliders/specialist-thumb',
											null,
											$params
										);
									?>
								</div>
						<?php endforeach; ?>
					</div>
				</div>
			</div>
		</div>
		<div class="slider-navigation-wrapper">
			<div class="swiper-scrollbar"></div>
			<div class="swiper-navigation">
				<button data-button="prev" class="btn-slider btn-slider-prev">
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
				<button data-button="next" class="btn-slider btn-slider-next">
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

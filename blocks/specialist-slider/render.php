<?php
/**
 * Server-side rendering for the theme/specialist-slider block.
 *
 * @package theme
 */

$slides = array();

if ( function_exists( 'render_specialist_slide' ) ) {
	foreach ( $attributes['slides'] as $slide ) {
		if ( ! is_array( $slide ) || empty( $slide['doctorId'] ) ) {
			continue;
		}

		$rendered_slide = render_specialist_slide( $slide['doctorId'] );

		if ( '' !== $rendered_slide ) {
			$slides[] = $rendered_slide;
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
						foreach ( $attributes['slides'] as $slide ) :
								$params = array( 'post_id' => $slide['doctorId'] );
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
					<i class="icon-f-arrow-shot-left-light"></i>
				</button>
				<button data-button="next" class="btn-slider btn-slider-next">
					<i class="icon-f-arrow-shot-right-light"></i>
				</button>
			</div>
		</div>
	</div>
</div>

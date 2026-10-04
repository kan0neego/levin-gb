<?php
/**
 * Server-side rendering for the theme/doctor-prose block.
 *
 * @package theme
 */

$author      = isset( $attributes['author'] ) ? $attributes['author'] : array();
$author_id   = isset( $author['id'] ) ? absint( $author['id'] ) : 0;
$author_name = get_the_title( $author_id );
$author_exp  = num_decline( gmdate( 'Y' ) - get_field( 'experience', $author_id, false ), 'год, года, лет' );
$author_spec = wp_strip_all_tags( get_the_excerpt( $author_id ) );
$description = $attributes['description']['edited'] ? $attributes['description']['value'] : get_field( 'banner_text', $author_id, false );
$picture_url = get_field( 'clipped_photo_list', $author_id );
?>

<div <?php echo get_block_wrapper_attributes( array( 'class' => 'dc-prose' ) ); ?>>
	<div class="dc-prose__img-wrapper">
		<div class="dc-prose__image">
			<?php if ( $picture_url ) : ?>
				<img src="<?php echo esc_url( $picture_url ); ?>" alt="<?php echo esc_attr( $author_name ); ?>" loading="lazy">
			<?php endif; ?>
		</div>
	</div>
	<div class="dc-prose__content">
		<div class="dc-prose__header">
			<div class="dc-prose__name">
				<?php echo esc_html( $author_name ); ?>
			</div>
			<div class="dc-prose__snippet">
				<?php echo esc_html( $author_spec ); ?>
			</div>
		</div>
		<div class="dc-prose__b-wr">
			<div class="dc-prose__b">
				Стаж <?php echo esc_html( $author_exp ); ?>
			</div>
		</div>
		<div class="dc-prose__text">
			<?php echo esc_html( $description ); ?>
		</div>
		<div class="dc-prose__footer">
			<div class="section-button">Заказать звонок</div>
		</div>
	</div>
</div>

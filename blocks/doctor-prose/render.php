<?php
/**
 * Server-side rendering for the theme/doctor-prose block.
 *
 * @package theme
 */

$author    = isset( $attributes['author'] ) ? $attributes['author'] : array();
$author_id = isset( $author['id'] ) ? absint( $author['id'] ) : 0;
$doctor    = class_exists( 'Doctor' ) ? new Doctor( $author_id ) : null;
$is_doctor = $doctor instanceof Doctor && $doctor->exists();

$author_name = $is_doctor ? $doctor->get_title() : '';
$author_spec = $is_doctor ? $doctor->get_spec() : '';
$author_exp  = $is_doctor ? $doctor->get_experience_label() : '';
$picture_url = $is_doctor ? $doctor->get_block_picture_url() : '';
$is_active   = $is_doctor && $doctor->is_active();
$banner_text = $is_doctor ? $doctor->get_banner_text() : '';

$description_attr = isset( $attributes['description'] ) ? $attributes['description'] : array();
$description      = ! empty( $description_attr['edited'] ) ? $description_attr['value'] : $banner_text;

if ( $is_active ) {
	$button_link = $doctor->get_permalink();
	$button_attr = 'target="_blank"';
	$button_text = 'Подробнее о враче';
} else {
	$button_link = '#';
	$button_attr = 'data-toggle="modal" data-target="#myModal2"';
	$button_text = 'Записаться на прием';
}
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
		<?php if ( $author_exp ) : ?>
		<div class="dc-prose__b-wr">
			<div class="dc-prose__b">
				Стаж <?php echo esc_html( $author_exp ); ?>
			</div>
		</div>
		<?php endif; ?>
		<div class="dc-prose__text">
			<?php echo esc_html( $description ); ?>
		</div>
		<div class="dc-prose__footer">
			<a href="<?php echo esc_url( $button_link ); ?>" <?php echo $button_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> class="section-button">
				<?php echo esc_html( $button_text ); ?>
			</a>
		</div>
	</div>
</div>

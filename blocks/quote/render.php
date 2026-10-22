<?php
/**
 * Server-side rendering for the theme/quote block.
 *
 * @package theme
 */

$heading    = isset( $attributes['heading'] ) ? $attributes['heading'] : '';
$variations = isset( $attributes['variations'] ) ? $attributes['variations'] : '';
$author     = isset( $attributes['author'] ) ? $attributes['author'] : array();
$author_id  = isset( $author['id'] ) ? absint( $author['id'] ) : 0;
$doctor     = class_exists( 'Doctor' ) ? new Doctor( $author_id ) : null;
$is_author  = $doctor instanceof Doctor && $doctor->exists();

$author_name = $is_author ? $doctor->get_title() : '';
$spec        = $is_author ? $doctor->get_spec() : '';
$avatar_url  = $is_author ? $doctor->get_avatar_url() : '';
$picture_url = $is_author ? $doctor->get_list_picture_url() : '';
$author_link = $is_author ? $doctor->get_permalink() : '';

$is_rounded    = false !== strpos( $variations, 'rounded' );
$wrapper_class = 'quote' . ( '' !== $variations ? ' ' . $variations : '' );
?>

<div <?php echo get_block_wrapper_attributes( array( 'class' => $wrapper_class ) ); ?>>
	<div class="quote__picture">
		<?php if ( $picture_url ) : ?>
			<?php if ( ! $is_rounded ) : ?>
				<img src="<?php echo esc_url( $picture_url ); ?>" alt="<?php echo esc_attr( $author_name ); ?>" loading="lazy">
			<?php else : ?>
				<div class="quote__picture-circle">
					<img src="<?php echo esc_url( $picture_url ); ?>" alt="<?php echo esc_attr( $author_name ); ?>" loading="lazy">
				</div>
			<?php endif; ?>
		<?php endif; ?>
	</div>
	<div class="quote__content">
		<div class="quote__header">
			<?php echo wp_kses_post( $heading ); ?>
		</div>
		<div class="quote__prose">
			<?php echo wp_kses_post( $content ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
		<?php if ( $is_author ) : ?>
		<div class="quote__author">
			<div class="avatar">
				<div class="quote__avatar-img avatar__img">
					<?php if ( $avatar_url ) : ?>
						<img src="<?php echo esc_url( $avatar_url ); ?>" alt="<?php echo esc_attr( $author_name ); ?>" loading="lazy">
					<?php endif; ?>
				</div>
				<div class="avatar__meta">
					<div class="avatar__title">
						<a href="<?php echo esc_url( $author_link ); ?>">
							<?php echo esc_html( $author_name ); ?>
						</a>
					</div>
					<div class="avatar__description">
						<?php echo esc_html( $spec ); ?>
					</div>
				</div>
			</div>
		</div>
		<?php endif; ?>
	</div>
</div>

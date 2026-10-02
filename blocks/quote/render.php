<?php
/**
 * Server-side rendering for the theme/quote block.
 *
 * @package theme
 */

$heading    = isset( $attributes['heading'] ) ? $attributes['heading'] : '';
$variations = isset( $attributes['variations'] ) ? $attributes['variations'] : '';
$author     = isset( $attributes['author'] ) ? $attributes['author'] : array();

$author_id   = isset( $author['id'] ) ? absint( $author['id'] ) : 0;
$author_name = isset( $author['name'] ) ? $author['name'] : '';
$spec        = isset( $author['spec'] ) ? $author['spec'] : '';
$avatar_url  = isset( $author['avatar'] ) ? $author['avatar'] : '';
$picture_url = isset( $author['picture'] ) ? $author['picture'] : '';


if ( $author_id > 0 ) {
	if ( '' === $author_name ) {
		$author_name = get_the_title( $author_id );
	}
	if ( '' === $spec ) {
		$spec = wp_strip_all_tags( get_the_excerpt( $author_id ) );
	}
	if ( '' === $avatar_url ) {
		$avatar_url = get_field( 'avatar', $author_id );
	}
	if ( '' === $picture_url ) {
		$picture_url = get_field( 'clipped_photo_list', $author_id );
	}
}

$is_author = $author_id > 0;

$is_rounded = ( false !== strpos( $variations, 'rounded' ) );

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
			<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
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
						<div class="avatar__title"><?php echo esc_html( $author_name ); ?></div>
						<div class="avatar__description"><?php echo esc_html( $spec ); ?></div>
					</div>
				</div>
			</div>
		<?php endif; ?>
	</div>
</div>

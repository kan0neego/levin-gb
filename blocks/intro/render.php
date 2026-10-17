<?php
/**
 * Server-side rendering for the theme/prose-intro.
 *
 * @package theme
 */

$intro = isset($attributes['content']) ? $attributes['content'] : '';
?>

<p class="wp-block-paragraph is-style-introduction"><?php echo wp_kses_post($intro); ?></p>

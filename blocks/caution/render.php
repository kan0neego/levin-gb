<?php
/**
 * Server-side rendering for the theme/warn.
 *
 * @package theme
 */

$warn_content = isset($attributes['content']) ? $attributes['content'] : '';
?>

<div class="important">
    <?php echo wp_kses_post($warn_content); ?>
</div>

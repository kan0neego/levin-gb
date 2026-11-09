<?php
/**
 * Миграция старых theme/tabs + theme/tab-pane в новые theme/tabs + theme/tab.
 *
 * Ревизии не читает и не меняет. Чужой контент поста остаётся как был:
 * заменяется только сырой фрагмент блока theme/tabs.
 *
 * По умолчанию ничего не записывает.
 *
 *   wp eval-file bin/migrate-tabs.php sample
 *   wp eval-file bin/migrate-tabs.php 123
 *   wp eval-file bin/migrate-tabs.php
 *   wp eval-file bin/migrate-tabs.php 123 write
 *   wp eval-file bin/migrate-tabs.php all write
 *
 * @package theme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Схлопывает HTML в одну строку для сравнения названия и заголовка.
 *
 * @param string $value Сырой текст или HTML.
 * @return string
 */
function levin_tabs_plain_text( $value ) {
	$text = wp_strip_all_tags( (string) $value );
	$text = html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	$text = str_replace( "\xc2\xa0", ' ', $text );

	$normalized = preg_replace( '/\s+/u', ' ', $text );
	if ( null === $normalized ) {
		$normalized = preg_replace( '/\s+/', ' ', $text );
	}

	return trim( (string) $normalized );
}

/**
 * @param array<string, mixed> $attrs Атрибуты вкладки.
 * @return bool
 */
function levin_tabs_pane_duplicates_title( $attrs ) {
	if ( ! array_key_exists( 'duplicateTitle', $attrs ) ) {
		return true;
	}

	return (bool) $attrs['duplicateTitle'];
}

/**
 * @param string $content Пост.
 * @param int    $offset  Смещение.
 * @return int
 */
function levin_tabs_skip_ws( $content, $offset ) {
	$length = strlen( $content );

	while ( $offset < $length && ctype_space( $content[ $offset ] ) ) {
		++$offset;
	}

	return $offset;
}

/**
 * Читает JSON-объект с учётом строк и вложенных скобок.
 *
 * @param string $content Пост.
 * @param int    $offset  Позиция открывающей скобки.
 * @return array{0:int,1:int}|null Начало и конец объекта.
 */
function levin_tabs_read_json_object( $content, $offset ) {
	$length = strlen( $content );

	if ( $offset >= $length || '{' !== $content[ $offset ] ) {
		return null;
	}

	$depth     = 0;
	$in_string = false;
	$escape    = false;

	for ( $index = $offset; $index < $length; $index++ ) {
		$char = $content[ $index ];

		if ( $in_string ) {
			if ( $escape ) {
				$escape = false;
				continue;
			}

			if ( '\\' === $char ) {
				$escape = true;
				continue;
			}

			if ( '"' === $char ) {
				$in_string = false;
			}

			continue;
		}

		if ( '"' === $char ) {
			$in_string = true;
			continue;
		}

		if ( '{' === $char ) {
			++$depth;
			continue;
		}

		if ( '}' === $char ) {
			--$depth;

			if ( 0 === $depth ) {
				return array( $offset, $index + 1 );
			}
		}
	}

	return null;
}

/**
 * Следующий открывающий или самозакрывающийся комментарий theme/tabs.
 *
 * @param string $content Пост.
 * @param int    $from    Откуда искать.
 * @return array{start:int,end:int,self:bool}|null
 */
function levin_tabs_next_open( $content, $from ) {
	$needle = '<!-- wp:theme/tabs';
	$length = strlen( $content );
	$pos    = $from;

	while ( false !== ( $pos = strpos( $content, $needle, $pos ) ) ) {
		$after = $pos + strlen( $needle );
		$next  = $after < $length ? $content[ $after ] : '';

		if ( '' !== $next && ! ctype_space( $next ) && '/' !== $next ) {
			$pos = $after;
			continue;
		}

		$index = levin_tabs_skip_ws( $content, $after );

		if ( $index < $length && '{' === $content[ $index ] ) {
			$json = levin_tabs_read_json_object( $content, $index );

			if ( null === $json ) {
				return null;
			}

			$index = levin_tabs_skip_ws( $content, $json[1] );
		}

		if ( $index + 4 <= $length && '/-->' === substr( $content, $index, 4 ) ) {
			return array(
				'start' => $pos,
				'end'   => $index + 4,
				'self'  => true,
			);
		}

		if ( $index + 3 <= $length && '-->' === substr( $content, $index, 3 ) ) {
			return array(
				'start' => $pos,
				'end'   => $index + 3,
				'self'  => false,
			);
		}

		$pos = $after;
	}

	return null;
}

/**
 * @param string $content Пост.
 * @param int    $from    Откуда искать.
 * @return array{0:int,1:int}|null
 */
function levin_tabs_next_close( $content, $from ) {
	$token = '<!-- /wp:theme/tabs';
	$pos   = $from;

	while ( false !== ( $pos = strpos( $content, $token, $pos ) ) ) {
		$index = levin_tabs_skip_ws( $content, $pos + strlen( $token ) );

		if ( '-->' === substr( $content, $index, 3 ) ) {
			return array( $pos, $index + 3 );
		}

		$pos += strlen( $token );
	}

	return null;
}

/**
 * Границы одного блока theme/tabs, включая вложенные группы.
 *
 * @param string $content Пост.
 * @param int    $from    Откуда искать.
 * @return array{start:int,end:int,error?:string}|null
 */
function levin_tabs_span( $content, $from ) {
	$open = levin_tabs_next_open( $content, $from );

	if ( null === $open ) {
		return null;
	}

	if ( $open['self'] ) {
		return $open;
	}

	$depth  = 1;
	$cursor = $open['end'];

	while ( $depth > 0 ) {
		$next_open  = levin_tabs_next_open( $content, $cursor );
		$next_close = levin_tabs_next_close( $content, $cursor );

		if ( null === $next_close ) {
			return array(
				'start' => $open['start'],
				'end'   => $open['end'],
				'error' => 'unclosed',
			);
		}

		if ( null !== $next_open && $next_open['start'] < $next_close[0] ) {
			if ( ! $next_open['self'] ) {
				++$depth;
			}

			$cursor = $next_open['end'];
			continue;
		}

		--$depth;
		$cursor = $next_close[1];
	}

	return array(
		'start' => $open['start'],
		'end'   => $cursor,
	);
}

/**
 * Собирает динамический блок, у которого в сохранённом контенте только потомки.
 *
 * @param string                    $name   Имя блока.
 * @param array<string, mixed>      $attrs  Атрибуты.
 * @param array<int, array<string, mixed>> $blocks Потомки.
 * @return array<string, mixed>
 */
function levin_tabs_container( $name, $attrs, $blocks ) {
	$blocks        = array_values( $blocks );
	$inner_content = array();

	if ( $blocks ) {
		$inner_content[] = "\n";

		foreach ( $blocks as $index => $block ) {
			if ( $index > 0 ) {
				$inner_content[] = "\n\n";
			}

			$inner_content[] = null;
		}

		$inner_content[] = "\n";
	}

	$inner_html = '';

	foreach ( $inner_content as $chunk ) {
		if ( is_string( $chunk ) ) {
			$inner_html .= $chunk;
		}
	}

	return array(
		'blockName'    => $name,
		'attrs'        => $attrs,
		'innerBlocks'  => $blocks,
		'innerHTML'    => $inner_html,
		'innerContent' => $inner_content,
	);
}

/**
 * Убирает пустые свободные фрагменты между блоками.
 *
 * @param array<int, array<string, mixed>> $blocks Блоки.
 * @return array<int, array<string, mixed>>
 */
function levin_tabs_without_empty_freeform( $blocks ) {
	$kept = array();

	foreach ( $blocks as $block ) {
		$name = $block['blockName'] ?? null;
		$html = (string) ( $block['innerHTML'] ?? '' );

		if ( null === $name && '' === trim( $html ) ) {
			continue;
		}

		$kept[] = $block;
	}

	return $kept;
}

/**
 * Заменяет вложенные старые табы, не трогая разметку остальных блоков.
 *
 * @param array<int, array<string, mixed>> $blocks        Блоки.
 * @param int                               $group_counter Счётчик групп.
 * @param array<string, int>                $stats         Счётчики.
 * @return array<int, array<string, mixed>>
 */
function levin_tabs_rewrite_tree( $blocks, &$group_counter, &$stats ) {
	foreach ( $blocks as $index => $block ) {
		$name = $block['blockName'] ?? null;

		if ( 'theme/tabs' === $name ) {
			$blocks[ $index ] = levin_tabs_convert_group( $block, $group_counter, $stats );
			continue;
		}

		if ( ! empty( $block['innerBlocks'] ) ) {
			$block['innerBlocks'] = levin_tabs_rewrite_tree( $block['innerBlocks'], $group_counter, $stats );
			$blocks[ $index ]     = $block;
		}
	}

	return $blocks;
}

/**
 * Снимает первый core/heading, если он дублирует название вкладки.
 *
 * @param array<int, array<string, mixed>> $blocks    Содержимое вкладки.
 * @param string                            $label    Название вкладки.
 * @param bool                              $duplicate Вкладка дублировала название.
 * @param array<string, int>                $stats    Счётчики.
 * @return array<int, array<string, mixed>>
 */
function levin_tabs_strip_heading( $blocks, $label, $duplicate, &$stats ) {
	if ( ! $duplicate || ! $blocks ) {
		return $blocks;
	}

	$first = $blocks[0];

	if ( 'core/heading' !== ( $first['blockName'] ?? null ) ) {
		return $blocks;
	}

	$heading = levin_tabs_plain_text( (string) ( $first['innerHTML'] ?? '' ) );

	if ( $heading !== levin_tabs_plain_text( $label ) ) {
		++$stats['headings_kept'];
		return $blocks;
	}

	array_shift( $blocks );
	++$stats['headings_removed'];

	return $blocks;
}

/**
 * @param array<string, mixed> $block         Разобранный theme/tabs.
 * @param int                  $group_counter Счётчик групп в посте.
 * @param array<string, int>   $stats         Счётчики.
 * @return array<string, mixed>
 */
function levin_tabs_convert_group( $block, &$group_counter, &$stats ) {
	++$group_counter;
	++$stats['groups'];

	$group = $group_counter;
	$panes = array();
	$other = array();

	foreach ( $block['innerBlocks'] ?? array() as $inner ) {
		$name = $inner['blockName'] ?? null;

		if ( 'theme/tab-pane' === $name ) {
			$panes[] = $inner;
			continue;
		}

		$html = (string) ( $inner['innerHTML'] ?? '' );

		if ( null === $name && '' === trim( $html ) ) {
			continue;
		}

		$other[] = $inner;
	}

	$all_off    = count( $panes ) > 0;
	$pane_index = 0;
	$children   = array();

	foreach ( $panes as $pane ) {
		++$pane_index;

		$attrs     = is_array( $pane['attrs'] ?? null ) ? $pane['attrs'] : array();
		$duplicate = levin_tabs_pane_duplicates_title( $attrs );
		$label     = isset( $attrs['label'] ) ? (string) $attrs['label'] : '';

		if ( $duplicate ) {
			$all_off = false;
		}

		$inner_blocks = levin_tabs_without_empty_freeform( $pane['innerBlocks'] ?? array() );
		$inner_blocks = levin_tabs_rewrite_tree( $inner_blocks, $group_counter, $stats );
		$inner_blocks = levin_tabs_strip_heading( $inner_blocks, $label, $duplicate, $stats );

		$tab_attrs = array(
			'id' => sprintf( 'tab-%d-%d', $group, $pane_index ),
		);

		if ( '' !== $label ) {
			$tab_attrs['label'] = $label;
		}

		$children[] = levin_tabs_container( 'theme/tab', $tab_attrs, $inner_blocks );
		++$stats['panes'];
	}

	foreach ( $other as $inner ) {
		$rewritten = levin_tabs_rewrite_tree( array( $inner ), $group_counter, $stats );
		foreach ( $rewritten as $item ) {
			$children[] = $item;
		}
	}

	$parent_attrs = array();

	if ( $all_off ) {
		$parent_attrs['duplicateTitle'] = false;
		++$stats['duplicate_off'];
	}

	return levin_tabs_container( 'theme/tabs', $parent_attrs, $children );
}

/**
 * @param string             $content Контент поста.
 * @param array<string, int> $stats   Счётчики.
 * @param array<int, string> $samples Новая разметка заменённых групп.
 * @return string
 */
function levin_tabs_migrate_content( $content, &$stats, &$samples ) {
	$group_counter = 0;
	$result        = '';
	$offset        = 0;
	$length        = strlen( $content );

	while ( $offset < $length ) {
		$span = levin_tabs_span( $content, $offset );

		if ( null === $span ) {
			$result .= substr( $content, $offset );
			break;
		}

		$result .= substr( $content, $offset, $span['start'] - $offset );

		if ( ! empty( $span['error'] ) ) {
			$result .= substr( $content, $span['start'], $span['end'] - $span['start'] );
			++$stats['errors'];
			$offset = $span['end'];
			continue;
		}

		$raw = substr( $content, $span['start'], $span['end'] - $span['start'] );

		if ( false === strpos( $raw, 'wp:theme/tab-pane' ) ) {
			$result .= $raw;
			++$stats['skipped'];
			$offset = $span['end'];
			continue;
		}

		$parsed = parse_blocks( $raw );
		$block  = null;

		foreach ( $parsed as $candidate ) {
			if ( 'theme/tabs' === ( $candidate['blockName'] ?? null ) ) {
				$block = $candidate;
				break;
			}
		}

		if ( null === $block ) {
			$result .= $raw;
			++$stats['errors'];
			$offset = $span['end'];
			continue;
		}

		$migrated = levin_tabs_convert_group( $block, $group_counter, $stats );
		$markup   = trim( serialize_block( $migrated ) );
		$result  .= $markup;
		$samples[] = $markup;
		$offset    = $span['end'];
	}

	return $result;
}

/**
 * @return array<string, int>
 */
function levin_tabs_stats() {
	return array(
		'posts'            => 0,
		'changed'          => 0,
		'groups'           => 0,
		'panes'            => 0,
		'headings_removed' => 0,
		'headings_kept'    => 0,
		'duplicate_off'    => 0,
		'skipped'          => 0,
		'errors'           => 0,
		'written'          => 0,
	);
}

$positional = ( isset( $args ) && is_array( $args ) ) ? $args : array();
$write      = in_array( 'write', $positional, true );
$target     = null;
$sample     = in_array( 'sample', $positional, true );

foreach ( $positional as $arg ) {
	if ( 'write' === $arg || 'all' === $arg || 'sample' === $arg ) {
		continue;
	}

	if ( ctype_digit( (string) $arg ) ) {
		$target = (int) $arg;
	}
}

global $wpdb;

if ( null !== $target ) {
	$ids = array( $target );
} elseif ( $sample ) {
	$ids = $wpdb->get_col(
		"SELECT ID FROM {$wpdb->posts}
		WHERE post_type = 'post'
			AND post_status = 'publish'
			AND post_content LIKE '%wp:theme/tab-pane%'
		ORDER BY ID DESC
		LIMIT 1"
	);
} else {
	$ids = $wpdb->get_col(
		"SELECT ID FROM {$wpdb->posts}
		WHERE post_type <> 'revision'
			AND post_status <> 'auto-draft'
			AND post_content LIKE '%wp:theme/tab-pane%'
		ORDER BY ID ASC"
	);
}

$stats   = levin_tabs_stats();
$verbose = null !== $target || $sample;

foreach ( $ids as $post_id ) {
	$post_id = (int) $post_id;
	$post    = get_post( $post_id );

	if ( ! $post || 'revision' === $post->post_type ) {
		WP_CLI::warning( "Пропуск {$post_id}: записи нет или это ревизия." );
		continue;
	}

	++$stats['posts'];

	$content = (string) $post->post_content;

	if ( false === strpos( $content, 'wp:theme/tab-pane' ) ) {
		if ( $verbose ) {
			WP_CLI::log( "Пост {$post_id} не содержит theme/tab-pane." );
		}
		continue;
	}

	$before = $stats;
	$chunks = array();
	$next   = levin_tabs_migrate_content( $content, $stats, $chunks );

	if ( $next === $content ) {
		continue;
	}

	++$stats['changed'];

	if ( $verbose ) {
		WP_CLI::log( 'Пост ' . $post_id . ' — ' . get_the_title( $post ) );
		WP_CLI::log( 'Групп: ' . ( $stats['groups'] - $before['groups'] ) );
		WP_CLI::log( 'Вкладок: ' . ( $stats['panes'] - $before['panes'] ) );
		WP_CLI::log( 'Снято заголовков: ' . ( $stats['headings_removed'] - $before['headings_removed'] ) );
		WP_CLI::log( 'Заголовков оставлено: ' . ( $stats['headings_kept'] - $before['headings_kept'] ) );
		WP_CLI::log( 'Групп без дубля: ' . ( $stats['duplicate_off'] - $before['duplicate_off'] ) );
		WP_CLI::log( str_repeat( '-', 40 ) );

		foreach ( $chunks as $chunk ) {
			WP_CLI::log( $chunk );
			WP_CLI::log( str_repeat( '-', 40 ) );
		}
	}

	if ( ! $write ) {
		continue;
	}

	$updated = $wpdb->update(
		$wpdb->posts,
		array( 'post_content' => $next ),
		array( 'ID' => $post_id ),
		array( '%s' ),
		array( '%d' )
	);

	if ( false === $updated ) {
		++$stats['errors'];
		WP_CLI::warning( "Не удалось записать пост {$post_id}." );
		continue;
	}

	clean_post_cache( $post_id );
	++$stats['written'];
}

WP_CLI::log( $write ? 'Запись включена.' : 'Пробный прогон, база не изменена.' );
WP_CLI::log( 'Постов: ' . $stats['posts'] );
WP_CLI::log( 'Изменятся: ' . $stats['changed'] );
WP_CLI::log( 'Записано: ' . $stats['written'] );
WP_CLI::log( 'Групп: ' . $stats['groups'] );
WP_CLI::log( 'Вкладок: ' . $stats['panes'] );
WP_CLI::log( 'Снято дублирующих заголовков: ' . $stats['headings_removed'] );
WP_CLI::log( 'Заголовков с другим текстом: ' . $stats['headings_kept'] );
WP_CLI::log( 'Групп с выключенным дублем: ' . $stats['duplicate_off'] );
WP_CLI::log( 'Уже новых групп: ' . $stats['skipped'] );
WP_CLI::log( 'Ошибок: ' . $stats['errors'] );

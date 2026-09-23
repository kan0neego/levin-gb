import { useCallback, useEffect, useState } from "@wordpress/element";
import { useDebouncedValue } from "@lib/hooks/use-debounced-value";

import { ALL_TERMS, SEARCH_DELAY } from "./constants";

/**
 * Состояние фильтров списка записей: поиск и выбранный термин таксономии.
 *
 * Хук хранит только состояние — запросы и проверка существования термина
 * остаются за его потребителем.
 *
 * @param {Object} options
 * @param {string} options.postType - Слаг типа записи.
 * @param {string} options.taxonomy - Слаг таксономии фильтра.
 * @returns {Object} Значения фильтров и обработчики.
 */
export function useRelationFilters({ postType, taxonomy }) {
	const [search, setSearch] = useState("");
	const [termId, setTermId] = useState(ALL_TERMS);
	const debouncedSearch = useDebouncedValue(search, SEARCH_DELAY);

	// При смене типа записи или таксономии прежний термин неактуален.
	useEffect(() => {
		setTermId(ALL_TERMS);
		setSearch("");
	}, [postType, taxonomy]);

	const reset = useCallback(() => {
		setSearch("");
		setTermId(ALL_TERMS);
	}, []);

	return {
		search,
		setSearch,
		termId,
		setTermId,
		// Поиск уходит в запрос только после задержки и без крайних пробелов.
		normalizedSearch: debouncedSearch.trim(),
		hasActiveFilters: Boolean(termId) || Boolean(search),
		reset,
	};
}

import { useSelect } from "@wordpress/data";

/** Стор редактора записей: в нём есть текущая запись. */
const EDITOR_STORE = "core/editor";

/**
 * Текущая редактируемая запись: её ID и тип.
 *
 * Селекторы `getCurrentPostId`/`getCurrentPostType` живут в сторе
 * `core/editor`, а не в `core-data`, поэтому читаются здесь. Стор берётся по
 * имени: `@wordpress/editor` не входит в зависимости блоков темы.
 *
 * @returns {Object} `postId` и `postType` открытой в редакторе записи.
 */
export function useCurrentPost() {
  return useSelect((select) => {
    const editor = select(EDITOR_STORE);

    if (!editor?.getCurrentPostId) {
      return { postId: null, postType: null };
    }

    const postId = editor.getCurrentPostId() ?? null;

    return {
      postId,
      postType: postId ? editor.getCurrentPostType() : null,
    };
  }, []);
}

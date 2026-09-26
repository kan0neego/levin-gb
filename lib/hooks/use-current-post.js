import { useSelect } from "@wordpress/data";
import { store as editorStore } from "@wordpress/editor";

/**
 * Текущая редактируемая запись: её ID и тип.
 *
 * Селекторы `getCurrentPostId`/`getCurrentPostType` живут в сторе
 * `core/editor`, а не в `core-data`. Импорт стора из пакета добавляет
 * `wp-editor` в зависимости скрипта (`index.asset.php`), поэтому стор
 * гарантированно загружен до выполнения кода блока.
 *
 * @returns {Object} `postId` и `postType` открытой в редакторе записи.
 */
export function useCurrentPost() {
  return useSelect((select) => {
    const editor = select(editorStore);

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

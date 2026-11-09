(function () {
  "use strict";

  const { InnerBlocks, useBlockProps, useInnerBlocksProps } =
    window.wp.blockEditor;
  const { createBlock, registerBlockType } = window.wp.blocks;
  const { Button } = window.wp.components;
  const { useDispatch } = window.wp.data;
  const { createElement: el } = window.wp.element;

  const ITEM_BLOCK = "theme/standard-item";
  const ALLOWED_BLOCKS = [ITEM_BLOCK];
  const TEMPLATE = [[ITEM_BLOCK]];

  // Кнопка под пунктами. Штатный плюсик в углу блока слишком незаметен.
  function AddStandardButton({ rootClientId }) {
    const { insertBlock } = useDispatch("core/block-editor");

    return el(
      Button,
      {
        className: "standards__add",
        variant: "secondary",
        icon: "plus-alt2",
        onClick: () =>
          insertBlock(createBlock(ITEM_BLOCK), undefined, rootClientId),
      },
      "Добавить стандарт",
    );
  }

  registerBlockType("theme/standards", {
    edit: function ({ clientId }) {
      const blockProps = useBlockProps({ className: "standards" });
      const innerBlocksProps = useInnerBlocksProps(blockProps, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: TEMPLATE,
        templateInsertUpdatesSelection: false,
        renderAppender: () => el(AddStandardButton, { rootClientId: clientId }),
      });

      return el("div", innerBlocksProps);
    },

    save: () => el(InnerBlocks.Content),
  });
})();

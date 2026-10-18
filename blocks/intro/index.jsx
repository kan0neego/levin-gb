import { RichText, useBlockProps } from "@wordpress/block-editor";
import { createBlock, registerBlockType } from "@wordpress/blocks";
import { useDispatch } from "@wordpress/data";
import metadata from "./block.json";

registerBlockType(metadata.name, {
  ...metadata,

  transforms: {
    to: [
      {
        type: "block",
        blocks: ["core/paragraph"],
        transform: ({ content }) => createBlock("core/paragraph", { content }),
      },
    ],
  },

  edit: function ({ clientId, attributes, setAttributes }) {
    const { content } = attributes;
    const { insertAfterBlock } = useDispatch("core/block-editor");

    const insertAfterKeyDown = (event) => {
      if (event.key === "Enter" || event.key === "ArrowDown") {
        event.preventDefault();
        event.stopPropagation();
        insertAfterBlock(clientId);
      }
    };

    const blockProps = useBlockProps({
      className: "prose-intro",
      onKeyDown: insertAfterKeyDown,
    });

    return (
      <div {...blockProps}>
        <RichText
          tagName="p"
          value={content}
          className="wp-block-paragraph is-style-introduction"
          placeholder="Общий тезис статьи"
          onChange={(raw) => {
            setAttributes({ content: raw });
          }}
        />
      </div>
    );
  },

  save: ({ attributes }) => (
    <RichText.Content
      tagName="p"
      className="wp-block-paragraph is-style-introduction"
      value={attributes.content}
    />
  ),
});

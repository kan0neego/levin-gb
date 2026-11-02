import { createBlock } from "@wordpress/blocks";
import { InnerBlocks, PlainText, useBlockProps } from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import { Button } from "@wordpress/components";
import { PANE_TEMPLATE } from "../tab/edit";

export default function Edit({ clientId }) {
  const blockProps = useBlockProps({ className: "containers wide mb-90" });

  const children = useSelect(
    (select) => select("core/block-editor").getBlocks(clientId),
    [clientId],
  );

  const { updateBlockAttributes, insertBlock, removeBlock, selectBlock } =
    useDispatch("core/block-editor");

  function activate(id) {
    children.forEach((block) => {
      updateBlockAttributes(block.clientId, { active: block.clientId === id });
    });
  }

  function addTab() {
    const block = createBlock(
      "theme/tab-pane",
      { active: true },
      PANE_TEMPLATE.map(([name, attributes]) => createBlock(name, attributes)),
    );
    children.forEach((b) => {
      updateBlockAttributes(b.clientId, { active: false });
    });
    insertBlock(block, children.length, clientId);
    selectBlock(block.clientId);
  }

  function removeTab(id) {
    if (children.length <= 1) {
      return;
    }
    const wasActive = children.find((b) => b.clientId === id).attributes.active;
    removeBlock(id);
    if (wasActive) {
      const remaining = children.filter((b) => b.clientId !== id);
      if (remaining.length) {
        updateBlockAttributes(remaining[0].clientId, { active: true });
      }
    }
  }

  function setLabel(id, value) {
    updateBlockAttributes(id, {
      label: value.replace(/[\r\n]+/g, " "),
    });
  }

  return (
    <div {...blockProps}>
      <div className="tab-buttons">
        {children.map((block) => {
          const active = !!block.attributes.active;
          return (
            <div
              key={block.clientId}
              className={"tab-n" + (active ? " active" : "")}
              onClick={() => activate(block.clientId)}
            >
              <PlainText
                value={block.attributes.label || ""}
                onChange={(value) => setLabel(block.clientId, value)}
                placeholder="Заголовок вкладки..."
                onFocus={() => activate(block.clientId)}
              />
              {children.length > 1 && (
                <Button
                  variant="tertiary"
                  isDestructive
                  className="tab-remove-btn"
                  label="Удалить вкладку"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTab(block.clientId);
                  }}
                >
                  ✕
                </Button>
              )}
            </div>
          );
        })}
        <Button
          variant="tertiary"
          onClick={addTab}
          className="add-tab-btn"
          label="Добавить вкладку"
        >
          +
        </Button>
      </div>
      <div className="tab-tabs">
        <InnerBlocks
          allowedBlocks={["theme/tab-pane"]}
          template={[["theme/tab-pane", { active: true }, PANE_TEMPLATE]]}
          templateInsertUpdatesSelection={false}
          renderAppender={false}
        />
      </div>
    </div>
  );
}

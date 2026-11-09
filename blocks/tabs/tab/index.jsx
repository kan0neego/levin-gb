import {
  InnerBlocks,
  store,
  useBlockProps,
  useInnerBlocksProps,
} from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { useSelect } from "@wordpress/data";
import { useEffect } from "react";

import metadata from "./block.json";

const deprecated = [
  {
    attributes: metadata.attributes,
    supports: metadata.supports,
    save: function ({ attributes }) {
      const blockProps = useBlockProps.save();

      return (
        <div {...blockProps} id={attributes.id} className="tab-content-item">
          <div className="tab-item__wrapper">
            <div className="prose">
              <InnerBlocks.Content />
            </div>
          </div>
        </div>
      );
    },
  },
];

registerBlockType(metadata.name, {
  ...metadata,
  edit: function ({ clientId, setAttributes, attributes }) {
    const blockProps = useBlockProps();
    const { children, ...innerBlockProps } = useInnerBlocksProps(blockProps, {
      template: [
        [
          "core/paragraph",
          {
            placeholder: "Lorem ipsum dolor sit amet consectetur.",
          },
        ],
      ],
    });

    const { isActiveTab, duplicateTitle } = useSelect(
      (select) => {
        const { getBlockRootClientId, getBlockAttributes } = select(store);
        const parentId = getBlockRootClientId(clientId);
        const parentAttributes = parentId ? getBlockAttributes(parentId) : null;

        return {
          isActiveTab: parentAttributes?.activeTabIndex === clientId,
          duplicateTitle: parentAttributes?.duplicateTitle !== false,
        };
      },
      [clientId],
    );

    useEffect(() => {
      setAttributes({ id: clientId });
    }, []);

    return (
      <div {...blockProps}>
        <div
          className={`tab-content-item ${isActiveTab && "tab-active"}`}
          style={{ opacity: isActiveTab ? 1 : 0 }}
        >
          <div className="tab-item__wrapper">
            {isActiveTab && (
              <div {...innerBlockProps}>
                <div className="prose">
                  {duplicateTitle && attributes.label ? (
                    <h3>{attributes.label}</h3>
                  ) : null}
                  {children}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },

  save: () => <InnerBlocks.Content />,
  deprecated,
});

import { useInnerBlocksProps } from "@wordpress/block-editor";
import { Fragment } from "react";

import {
  hasSnapshotAuthorFields,
  migrateAuthorIdOnly,
} from "@/lib/blocks/migrate-author-id";
import metadata from "./block.json";

function save() {
  const innerBlocksProps = useInnerBlocksProps.save();
  return <Fragment {...innerBlocksProps}></Fragment>;
}

/**
 * Старые посты хранят снимок врача в `author`. save не менялся,
 * поэтому миграция идёт через isEligible.
 */
export const deprecated = [
  {
    attributes: {
      ...metadata.attributes,
      author: {
        type: "object",
        default: {
          id: "",
          name: "",
          spec: "",
          avatar: "",
          picture: "",
          experience: "",
        },
      },
    },
    supports: metadata.supports,
    isEligible: hasSnapshotAuthorFields,
    migrate: migrateAuthorIdOnly,
    save,
  },
];

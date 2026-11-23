import { useBlockProps } from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { VideoBlock } from "@/components/video";
import metadata from "./block.json";
import { deprecated } from "./deprecated";
import { useVideoIdMedia, VideoLibrarySlot } from "./library";
import "./index.scss";

registerBlockType(metadata.name, {
  ...metadata,
  deprecated,

  edit: function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();
    const resolved = useVideoIdMedia(attributes);

    return (
      <VideoBlock
        attributes={attributes}
        displayAttributes={resolved}
        setAttributes={setAttributes}
        title={metadata.title}
        setupLeading={
          <VideoLibrarySlot
            variant="setup"
            attributes={attributes}
            setAttributes={setAttributes}
          />
        }
        inspectorLeading={
          <VideoLibrarySlot
            variant="inspector"
            attributes={attributes}
            setAttributes={setAttributes}
          />
        }
      >
        {({ inspector, setup, figure }) => (
          <>
            {inspector}
            <div {...blockProps}>{setup || figure}</div>
          </>
        )}
      </VideoBlock>
    );
  },

  save: () => null,
});

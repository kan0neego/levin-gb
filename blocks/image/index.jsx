import { MediaSlider } from "@components/slider/media-slider";
import { Slide } from "@components/slider/slide";
import {
  BlockControls,
  MediaPlaceholder,
  MediaUpload,
  MediaUploadCheck,
  RichText,
  useBlockProps,
} from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { ToolbarButton, ToolbarGroup } from "@wordpress/components";
import metadata from "./block.json";
import "./index.scss";
import { createImageItem, isDownload, transforms } from "./transforms";

const mergeImageItem = (prev, curr) => {
  return curr.map((item) => {
    const match = prev.find((image) => image.id === item.id);
    console.log(match);
    return match ? { ...item, caption: match.caption || "" } : item;
  });
};

function EditorTools({ attributes, setAttributes }) {
  const { media } = attributes;
  const ids = media.map((item) => item.id);

  return (
    <BlockControls>
      <ToolbarGroup>
        <MediaUploadCheck>
          <MediaUpload
            value={ids}
            allowedTypes={["image"]}
            onSelect={(img) => {
              const item = createImageItem([img]);
              setAttributes(({ media }) => {
                return { media: mergeImageItem(media, item) };
              });
            }}
            render={({ open }) => (
              <ToolbarButton
                label="Изображение"
                icon={"format-image"}
                onClick={open}
              />
            )}
          />
        </MediaUploadCheck>
        <MediaUploadCheck>
          <MediaUpload
            value={ids}
            gallery
            multiple
            allowedTypes={["image"]}
            onSelect={(gallery) => {
              const items = createImageItem(gallery);
              setAttributes(({ media }) => {
                return { media: mergeImageItem(media, items) };
              });
            }}
            render={({ open }) => (
              <ToolbarButton
                label="Изображение"
                icon={"images-alt"}
                onClick={open}
              />
            )}
          />
        </MediaUploadCheck>
      </ToolbarGroup>
    </BlockControls>
  );
}

function FigureImage({ image, editable = false, set }) {
  const {
    sizes: { full },
  } = image;

  return (
    <figure
      className="wp-block-image bg-filter"
      style={{ "--img-url": `url(${image.url})` }}
    >
      <picture>
        <img src={image.url} width={full.width} height={full.height} />
      </picture>
      {editable && (
        <RichText
          value={image.caption ?? ""}
          tagName="figcaption"
          placeholder="Опишите изображение (опционально)"
          onChange={(text) => {
            const item = { ...image, caption: text };
            set(({ media }) => {
              const up = media.map((i) => (i.id === item.id ? item : i));
              return { media: up };
            });
          }}
        />
      )}
    </figure>
  );
}

function MediaWidget({ attributes, setAttributes }) {
  const { media } = attributes;
  const isMedia = media.length === 1;
  const isGallery = media.length > 1;
  const isEmpty = !isMedia && !isGallery;
  const blockProps = useBlockProps();

  return (
    <>
      <EditorTools attributes={attributes} setAttributes={setAttributes} />
      <div {...blockProps}>
        {isMedia && (
          <FigureImage image={media[0]} set={setAttributes} editable={true} />
        )}

        {isGallery && (
          <MediaSlider
            key={media.map((m) => m.id).join("-")}
            media={media}
            setItems={(next) => {
              setAttributes({ media: next });
            }}
          >
            {media.map((image) => (
              <Slide key={image.id}>
                <FigureImage image={image} />
              </Slide>
            ))}
          </MediaSlider>
        )}

        {isEmpty && (
          <MediaPlaceholder
            allowedTypes={["image"]}
            multiple
            onSelect={(selected) => {
              const list = Array.isArray(selected) ? selected : [selected];
              if (!list.every(isDownload)) return;
              const items = createImageItem(list);
              setAttributes({ media: items });
            }}
          />
        )}
      </div>
    </>
  );
}

registerBlockType(metadata.name, {
  ...metadata,
  transforms,

  edit: function ({ attributes, setAttributes }) {
    return (
      <MediaWidget attributes={attributes} setAttributes={setAttributes} />
    );
  },

  save: () => null,
});

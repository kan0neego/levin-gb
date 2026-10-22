import {
  InspectorControls,
  RichText,
  useBlockProps,
  useInnerBlocksProps,
} from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { PanelBody } from "@wordpress/components";

import { PostRelationControl } from "@components/post-relation-control";
import { Fragment, useMemo } from "react";

import BlockPlaceholder from "@/components/placeholder/block-placeholder";
import { isEmpty } from "@/lib/helpers/object";
import { useDoctor } from "@/lib/hooks/use-doctor";
import metadata from "./block.json";
import { deprecated } from "./deprecated";

const DOCTOR_POST_TYPE = "doctors";
const DOCTOR_TAXONOMY = "doctors_group";
const VALUE_KEY = "id";

function EditorTools({ attributes, setAttributes }) {
  const { author } = attributes;
  const EMPTY_AUTHOR = metadata.attributes.author.default;

  const relationValue = useMemo(
    () => (author?.id ? [{ [VALUE_KEY]: author.id }] : []),
    [author?.id],
  );

  const changeAuthor = (nextValue) => {
    const id = nextValue[0]?.[VALUE_KEY] ?? "";

    setAttributes({
      author: id ? { id } : EMPTY_AUTHOR,
      description: { edited: false, value: "" },
    });
  };

  return (
    <InspectorControls key={"setting"}>
      <PanelBody title={"Настройки блока"}>
        <PostRelationControl
          value={relationValue}
          onChange={changeAuthor}
          valueKey={VALUE_KEY}
          postType={DOCTOR_POST_TYPE}
          taxonomy={DOCTOR_TAXONOMY}
          selectionMode="single"
          selectedLabel="Врач"
          addLabel="Выбрать врача"
        />
      </PanelBody>
    </InspectorControls>
  );
}

registerBlockType(metadata.name, {
  ...metadata,
  deprecated,

  edit: function ({ attributes, setAttributes }) {
    const { description, author } = attributes;
    const blockProps = useBlockProps();
    const { children, ...innerProps } = useInnerBlocksProps(blockProps);
    const hasAuthor = !isEmpty(author.id);
    const { doctor } = useDoctor(author?.id);
    const preview = doctor || {};
    const picture = preview.pictureBlock || preview.picture || "";
    const descriptionValue = description.edited
      ? description.value
      : preview.options?.bannerDesc ?? "";
    const isActive = Boolean(preview.isActive);
    const buttonText = isActive ? "Подробнее о враче" : "Записаться на прием";

    return (
      <>
        <div {...innerProps}>
          {hasAuthor ? (
            <div className="dc-prose">
              <div className="dc-prose__img-wrapper">
                <div className="dc-prose__image">
                  {picture ? (
                    <img src={picture} alt={preview.name} loading="lazy" />
                  ) : null}
                </div>
              </div>
              <div className="dc-prose__content">
                <div className="dc-prose__header">
                  <div className="dc-prose__name">{preview.name}</div>
                  <div className="dc-prose__snippet">{preview.spec}</div>
                </div>
                {preview.experience ? (
                  <div className="dc-prose__b-wr">
                    <div className="dc-prose__b">Стаж {preview.experience}</div>
                  </div>
                ) : null}
                <RichText
                  value={descriptionValue}
                  placeholder={"Описание"}
                  className="dc-prose__text"
                  onChange={(value) => {
                    setAttributes({ description: { edited: true, value } });
                  }}
                />
                <div className="dc-prose__footer">
                  <div className="section-button">{buttonText}</div>
                </div>
              </div>
            </div>
          ) : (
            <BlockPlaceholder name={metadata.title} />
          )}
        </div>
        <EditorTools attributes={attributes} setAttributes={setAttributes} />
      </>
    );
  },

  save: () => {
    const innerBlocksProps = useInnerBlocksProps.save();
    return <Fragment {...innerBlocksProps}></Fragment>;
  },
});

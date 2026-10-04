import {
  InspectorControls,
  RichText,
  useBlockProps,
  useInnerBlocksProps,
} from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { PanelBody } from "@wordpress/components";

import { fetchDoctor } from "./lib/fetch-doctor";

import { PostRelationControl } from "@components/post-relation-control";
import { Fragment, useMemo } from "react";

import BlockPlaceholder from "@/components/placeholder/block-placeholder";
import { isEmpty } from "@/lib/helpers/object";
import metadata from "./block.json";

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

    if (!id) {
      setAttributes({
        author: EMPTY_AUTHOR,
        description: { edited: false, value: "" },
      });
      return;
    }

    fetchDoctor(id)
      .then((doctor) => {
        if (!doctor) return;
        const { options } = doctor;
        const { bannerDesc } = options;
        const description = { edited: false, value: bannerDesc };
        setAttributes({ author: doctor });
        setAttributes({ description });
      })
      .catch(() => {
        setAttributes({
          author: { ...EMPTY_AUTHOR, id },
          description: { edited: false, value: "" },
        });
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

  edit: function ({ attributes, setAttributes }) {
    const { description, author } = attributes;
    const blockProps = useBlockProps();
    const { children, ...innerProps } = useInnerBlocksProps(blockProps);
    const hasAuthor = !isEmpty(author.id);

    return (
      <>
        <div {...innerProps}>
          {hasAuthor ? (
            <div className="dc-prose">
              <div className="dc-prose__img-wrapper">
                <div className="dc-prose__image">
                  <img src={author.picture} alt={author.name} loading="lazy" />
                </div>
              </div>
              <div className="dc-prose__content">
                <div className="dc-prose__header">
                  <div className="dc-prose__name">{author.name}</div>
                  <div className="dc-prose__snippet">{author.spec}</div>
                </div>
                <div className="dc-prose__b-wr">
                  <div className="dc-prose__b">Стаж {author.experience}</div>
                </div>
                <RichText
                  value={description.value}
                  placeholder={"Описание"}
                  className="dc-prose__text"
                  onChange={(value) => {
                    setAttributes({ description: { edited: true, value } });
                  }}
                />
                <div className="dc-prose__footer">
                  <div className="section-button">Заказать звонок</div>
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

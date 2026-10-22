import {
  InspectorControls,
  RichText,
  useBlockProps,
  useInnerBlocksProps,
} from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { PanelBody, SelectControl } from "@wordpress/components";

import { AuthorAvatar } from "@components/avatar";
import { PostRelationControl } from "@components/post-relation-control";
import { Fragment, useMemo } from "react";

import { useDoctor } from "@/lib/hooks/use-doctor";
import metadata from "./block.json";
import { deprecated } from "./deprecated";
import "./index.scss";

const DOCTOR_POST_TYPE = "doctors";
const DOCTOR_TAXONOMY = "doctors_group";
const VALUE_KEY = "id";

const VARIATIONS = [
  { label: "Стандартная", value: "" },
  { label: "Изображение", value: "is-image" },
  { label: "Изображение (круг)", value: "is-image is-rounded-image" },
];

registerBlockType(metadata.name, {
  ...metadata,
  deprecated,

  edit: function ({ attributes, setAttributes }) {
    const { heading, author, variations } = attributes;
    const blockProps = useBlockProps();
    const { children, ...innerProps } = useInnerBlocksProps(blockProps);

    const authorId = author?.id;
    const isAuthor = Boolean(authorId);
    const isRounded = variations.includes("rounded");
    const EMPTY_AUTHOR = metadata.attributes.author.default;
    const { doctor } = useDoctor(authorId);
    const preview = doctor || EMPTY_AUTHOR;

    // Значение контрола — упорядоченный массив [{ id }] либо [].
    const relationValue = useMemo(
      () => (authorId ? [{ [VALUE_KEY]: authorId }] : []),
      [authorId],
    );

    const changeAuthor = (nextValue) => {
      const id = nextValue[0]?.[VALUE_KEY] ?? "";

      if (!id) {
        setAttributes({ author: EMPTY_AUTHOR, variations: "" });
        return;
      }

      setAttributes({ author: { id }, variations });
    };

    const changeVar = (value) => {
      setAttributes({ variations: value });
    };

    return (
      <>
        <InspectorControls key={"setting"}>
          <PanelBody title={"Настройки блока"}>
            <PostRelationControl
              value={relationValue}
              onChange={changeAuthor}
              valueKey={VALUE_KEY}
              postType={DOCTOR_POST_TYPE}
              taxonomy={DOCTOR_TAXONOMY}
              selectionMode="single"
              selectedLabel="Автор"
              addLabel="Выбрать автора"
              hint="Выберите автора цитаты."
            />
          </PanelBody>
          <PanelBody title={"Настройки отображения"}>
            <SelectControl
              label="Вариация"
              value={variations}
              options={VARIATIONS}
              disabled={!isAuthor}
              onChange={changeVar}
            />
          </PanelBody>
        </InspectorControls>
        <div {...innerProps}>
          <div class={`quote ${variations}`}>
            <div className="quote__picture">
              {!isRounded ? (
                <img src={preview.picture} alt={preview.name} loading="lazy" />
              ) : (
                <div className="quote__picture-circle">
                  <img
                    src={preview.picture}
                    alt={preview.name}
                    loading="lazy"
                  />
                </div>
              )}
            </div>
            <div className="quote__content">
              <RichText
                value={heading}
                placeholder={"Заголовок"}
                className="quote__header"
                onChange={(value) => {
                  setAttributes({ heading: value });
                }}
              />
              <div className="quote__prose">{children}</div>
              {isAuthor ? (
                <div class="quote__author">
                  <AuthorAvatar author={preview} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </>
    );
  },

  save: () => {
    const innerBlocksProps = useInnerBlocksProps.save();
    return <Fragment {...innerBlocksProps}></Fragment>;
  },
});

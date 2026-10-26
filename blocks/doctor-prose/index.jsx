import {
  InspectorControls,
  PlainText,
  useBlockProps,
  useInnerBlocksProps,
} from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import { PanelBody } from "@wordpress/components";

import { PostRelationControl } from "@components/post-relation-control";
import { Fragment, useMemo } from "react";

import { isEmpty } from "@/lib/helpers/object";
import { useDoctor } from "@/lib/hooks/use-doctor";
import metadata from "./block.json";
import { deprecated } from "./deprecated";
import "./index.scss";

const DOCTOR_POST_TYPE = "doctors";
const DOCTOR_TAXONOMY = "doctors_group";
const VALUE_KEY = "id";

const SAMPLE_PREVIEW = {
  name: "Анна Левина",
  spec: "Врач-косметолог",
  experience: "12 лет",
  text: "Составляет персональный план процедур и сопровождает на каждом этапе.",
  isActive: true,
  picture: "",
};

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

function DoctorPortrait({ picture, name }) {
  if (picture) {
    return <img src={picture} alt={name} loading="lazy" />;
  }

  return <span className="dc-prose__placeholder" aria-hidden="true" />;
}

function DoctorProseView({ doctor, onTextChange }) {
  const buttonText = doctor.isActive
    ? "Подробнее о враче"
    : "Записаться на прием";

  return (
    <div className="dc-prose">
      <div className="dc-prose__img-wrapper">
        <div className="dc-prose__image">
          <DoctorPortrait picture={doctor.picture} name={doctor.name} />
        </div>
      </div>
      <div className="dc-prose__content">
        <div className="dc-prose__header">
          <div className="dc-prose__name">{doctor.name}</div>
          <div className="dc-prose__snippet">{doctor.spec}</div>
        </div>
        {doctor.experience ? (
          <div className="dc-prose__b-wr">
            <div className="dc-prose__b">Стаж {doctor.experience}</div>
          </div>
        ) : null}
        {onTextChange ? (
          <PlainText
            value={doctor.text}
            placeholder="Описание"
            className="dc-prose__text"
            onChange={onTextChange}
          />
        ) : (
          <div className="dc-prose__text">{doctor.text}</div>
        )}
        <div className="dc-prose__footer">
          <div className="section-button">{buttonText}</div>
        </div>
      </div>
    </div>
  );
}

registerBlockType(metadata.name, {
  ...metadata,
  deprecated,

  edit: function ({ attributes, setAttributes }) {
    const { description, author } = attributes;
    const blockProps = useBlockProps();
    const { children, ...innerProps } = useInnerBlocksProps(blockProps);
    const hasAuthor = !isEmpty(author?.id);
    const { doctor } = useDoctor(hasAuthor ? author.id : "");
    const bannerText = doctor?.options?.bannerDesc ?? "";
    const descriptionValue = description?.edited
      ? description.value
      : bannerText;
    const view = hasAuthor
      ? {
          name: doctor?.name ?? "",
          spec: doctor?.spec ?? "",
          experience: doctor?.experience ?? "",
          text: descriptionValue,
          isActive: Boolean(doctor?.isActive),
          picture: doctor?.pictureBlock || doctor?.picture || "",
        }
      : SAMPLE_PREVIEW;

    const changeDescription = (value) => {
      setAttributes({ description: { edited: true, value } });
    };

    return (
      <>
        <div {...innerProps}>
          <DoctorProseView
            doctor={view}
            onTextChange={hasAuthor ? changeDescription : undefined}
          />
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

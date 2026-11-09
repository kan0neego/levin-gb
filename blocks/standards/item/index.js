(function () {
  "use strict";

  const { BlockControls, InspectorControls, RichText, useBlockProps } =
    window.wp.blockEditor;
  const { registerBlockType } = window.wp.blocks;
  const { Button, Dropdown, PanelBody, SelectControl, ToolbarButton } =
    window.wp.components;
  const { useEntityRecords } = window.wp.coreData;
  const {
    createElement: el,
    Fragment,
    useEffect,
    useRef,
    useState,
  } = window.wp.element;
  const { decodeEntities } = window.wp.htmlEntities;

  const POST_TYPE = "standards";
  const IMAGE_FIELD = "standard-image";
  const NO_FORMATS = [];
  const BOLD_ONLY = ["core/bold"];

  // Один запрос на все пункты: core-data кеширует его по этому объекту.
  const STANDARDS_QUERY = {
    per_page: 100,
    orderby: "title",
    order: "asc",
    status: "publish",
    _fields: "id,title,acf",
    acf_format: "standard",
  };

  // Попап рисуется вне холста, куда editorStyle не попадает, поэтому стили здесь.
  const PICKER_GRID_STYLE = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 96px)",
    gap: 4,
    padding: 8,
  };
  const PICKER_ITEM_STYLE = {
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 4,
    height: "auto",
    padding: 6,
    fontSize: 12,
    lineHeight: 1.2,
    whiteSpace: "normal",
  };
  const PICKER_IMAGE_STYLE = {
    width: 64,
    height: 64,
    objectFit: "contain",
  };

  function getStandardName(standard) {
    return decodeEntities(standard.title?.rendered ?? "");
  }

  function StandardPicker({ standards, standardId, onChange, renderToggle }) {
    return el(Dropdown, {
      popoverProps: { placement: "bottom-start" },
      renderToggle,
      renderContent: ({ onClose }) =>
        el(
          "div",
          { style: PICKER_GRID_STYLE },
          standards.map((standard) => {
            const picture = standard.acf?.[IMAGE_FIELD];

            return el(
              Button,
              {
                key: standard.id,
                style: PICKER_ITEM_STYLE,
                isPressed: standard.id === standardId,
                onClick: () => {
                  onChange(standard.id);
                  onClose();
                },
              },
              picture?.url &&
                el("img", {
                  style: PICKER_IMAGE_STYLE,
                  src: picture.sizes?.thumbnail ?? picture.url,
                  alt: "",
                }),
              getStandardName(standard),
            );
          }),
        ),
    });
  }

  function StandardSelect({ standards, standardId, onChange }) {
    const options = [
      { label: "Выберите стандарт", value: "0" },
      ...standards.map((standard) => ({
        label: getStandardName(standard),
        value: String(standard.id),
      })),
    ];

    return el(SelectControl, {
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true,
      hideLabelFromVision: true,
      label: "Стандарт",
      value: String(standardId),
      options,
      onChange: (value) => onChange(Number(value)),
    });
  }

  function StandardList({ items, onChange }) {
    const listRef = useRef(null);
    const [focusIndex, setFocusIndex] = useState(null);

    useEffect(() => {
      if (null === focusIndex || !listRef.current) {
        return;
      }

      listRef.current
        .querySelectorAll("[contenteditable]")
        [focusIndex]?.focus();
      setFocusIndex(null);
    }, [focusIndex]);

    const changeItem = (index, value) => {
      onChange(items.map((item, at) => (at === index ? value : item)));
    };

    const addItem = (index) => {
      onChange([...items.slice(0, index), "", ...items.slice(index)]);
      setFocusIndex(index);
    };

    const removeItem = (index) => {
      onChange(items.filter((_, at) => at !== index));
      setFocusIndex(Math.max(index - 1, 0));
    };

    const handleKeyDown = (index) => (event) => {
      if ("Enter" === event.key) {
        event.preventDefault();
        event.stopPropagation();
        addItem(index + 1);
      }

      if ("Backspace" === event.key && !items[index] && items.length > 1) {
        event.preventDefault();
        event.stopPropagation();
        removeItem(index);
      }
    };

    return el(
      "ul",
      { className: "wp-block-list", ref: listRef },
      items.map((item, index) =>
        el(
          "li",
          {
            className: "standards__list-item",
            key: index,
            onKeyDownCapture: handleKeyDown(index),
          },
          el(RichText, {
            tagName: "span",
            value: item,
            placeholder: "Пункт списка",
            allowedFormats: NO_FORMATS,
            disableLineBreaks: true,
            onChange: (value) => changeItem(index, value),
          }),
          items.length > 1 &&
            el(Button, {
              size: "small",
              icon: "no-alt",
              label: "Удалить пункт",
              onClick: () => removeItem(index),
            }),
        ),
      ),
    );
  }

  registerBlockType("theme/standard-item", {
    edit: function ({ attributes, setAttributes }) {
      const { standardId, title, subtitle, items } = attributes;
      // `.row` не на обёртке: его clearfix занимает `::after`, где редактор рисует рамку.
      const blockProps = useBlockProps();
      const { records } = useEntityRecords(
        "postType",
        POST_TYPE,
        STANDARDS_QUERY,
      );
      const standards = records ?? [];
      const standard = standards.find(({ id }) => id === standardId);
      const image = standard?.acf?.[IMAGE_FIELD];
      const selectStandard = (nextId) => setAttributes({ standardId: nextId });

      return el(
        Fragment,
        null,
        image?.url &&
          el(
            BlockControls,
            { group: "other" },
            el(StandardPicker, {
              standards,
              standardId,
              onChange: selectStandard,
              renderToggle: ({ isOpen, onToggle }) =>
                el(
                  ToolbarButton,
                  { "aria-expanded": isOpen, onClick: onToggle },
                  "Заменить",
                ),
            }),
          ),
        el(
          InspectorControls,
          null,
          el(
            PanelBody,
            { title: "Стандарт" },
            el(StandardSelect, {
              standards,
              standardId,
              onChange: selectStandard,
            }),
          ),
        ),
        el(
          "div",
          blockProps,
          el(
            "div",
            { className: "row row_center row_sm_center" },
            el(
              "div",
              { className: "col col-sm-5" },
              image?.url
                ? el("img", {
                    className: "d-block mx-auto",
                    src: image.url,
                    alt: "",
                  })
                : el(StandardPicker, {
                    standards,
                    standardId,
                    onChange: selectStandard,
                    renderToggle: ({ isOpen, onToggle }) =>
                      el(
                        "button",
                        {
                          type: "button",
                          className: "standards__placeholder",
                          "aria-expanded": isOpen,
                          onClick: onToggle,
                        },
                        "Выбрать стандарт",
                      ),
                  }),
            ),
            el(
              "div",
              { className: "col col-sm-7" },
              el(RichText, {
                tagName: "h3",
                className: "heading heading_h2",
                value: title,
                placeholder: "Заголовок",
                allowedFormats: BOLD_ONLY,
                disableLineBreaks: true,
                onChange: (value) => setAttributes({ title: value }),
              }),
              el(RichText, {
                tagName: "p",
                className: "text text_medium",
                value: subtitle,
                placeholder: "Подзаголовок",
                allowedFormats: NO_FORMATS,
                disableLineBreaks: true,
                onChange: (value) => setAttributes({ subtitle: value }),
              }),
              el(StandardList, {
                items,
                onChange: (nextItems) => setAttributes({ items: nextItems }),
              }),
            ),
          ),
        ),
      );
    },

    save: () => null,
  });
})();

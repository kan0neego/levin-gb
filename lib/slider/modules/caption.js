class CaptionController {
  constructor({ contentNode, textNode }) {
    this.contentNode = contentNode;
    this.textNode = textNode;
  }

  setCaptionText(text) {
    this.textNode.textContent = text ?? "";
    this.setHeightContent();
  }

  setHeightContent() {
    const h = this.textNode.offsetHeight;
    this.contentNode.style.height = `${h}px`;
  }
}

export default function Caption(_ref) {
  const { on } = _ref;

  if (typeof on !== "function") return null;

  const initCaption = (container) => {
    const contentNode = container.children[0];
    const textNode = contentNode.children[0];
    const elements = { contentNode, textNode };
    return new CaptionController(elements);
  };

  const findCaptionContainer = (el) => {
    return el.querySelector(".swiper-caption");
  };

  on("init", (sl) => {
    const { params } = sl;
    const sliderWrapper = params.el.parentElement;
    const container = findCaptionContainer(sliderWrapper);
    if (!container) return;
    const caption = initCaption(container);

    // В редакторе подписью владеет RichText (contenteditable) — не трогаем текст.
    if (caption.textNode.isContentEditable) return;

    caption.setCaptionText(sl.slides[0].dataset.caption);

    on("slideChange", (sl) => {
      caption.setCaptionText(sl.slides[sl.activeIndex].dataset.caption);
    });
  });
}

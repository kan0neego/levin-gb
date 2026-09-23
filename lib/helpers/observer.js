function isIterable(obj) {
  if (
    obj == null ||
    typeof obj == "string" ||
    typeof obj == "number" ||
    (obj && obj.nodeType)
  )
    return !1;
  return typeof obj[Symbol.iterator] === "function" || obj instanceof Array;
}

export default function observe(o, handler, opts = {}) {
  if (!o || (isIterable(o) && !o.length)) return;
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (collection) => {
        collection.forEach((entry, index) => {
          if (entry.intersectionRatio > 0) {
            if (!opts.multiple) observer.unobserve(entry.target);
            handler.call(entry.target, entry.target, index, entry);
            if (opts.any) {
              if (window.jQuery && o instanceof jQuery)
                o.each(function () {
                  observer.unobserve(this);
                });
              else if (isIterable(o)) {
                if (HTMLCollection.prototype.isPrototypeOf(o))
                  Array.from(o).forEach((element) =>
                    observer.unobserve(element),
                  );
                else o.forEach((element) => observer.unobserve(element));
              } else observer.unobserve(o);
            }
          }
        });
      },
      {
        rootMargin: "0px 0px 0px 0px",
        threshold: 0.01,
      },
    );
    if (window.jQuery && o instanceof jQuery)
      o.each(function () {
        observer.observe(this);
      });
    else if (isIterable(o)) {
      if (HTMLCollection.prototype.isPrototypeOf(o))
        Array.from(o).forEach((element) => observer.observe(element));
      else o.forEach((element) => observer.observe(element));
    } else observer.observe(o);
  } else {
    if (!isIterable(o)) handler.call(o, o, 0);
    else {
      Array.from(o).forEach((entry, index) => {
        handler.call(entry, entry, index);
      });
    }
  }
}

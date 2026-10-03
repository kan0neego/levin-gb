/**
 * @deprecated srcset может вести себя в редакторе не предсказуемо.
 *             Использовать его дальше нет необходимости.
 */

export function useImage(media) {
  const createSrcset = () => {
    const set = [];
    for (const [key, img] of Object.entries(media.sizes)) {
      if (key === "full") continue;
      const row = `${img.url} ${img.width}w`;
      set.push(row);
    }

    return set;
  };

  const srcset = createSrcset().join(", ");

  return {
    width: media.width,
    height: media.height,
    src: media.url,
    srcSet: srcset,
    loading: "lazy",
    decoding: "async",
  };
}

export function createOptions(obj) {
  const options = [];
  for (const [id, name] of Object.entries(obj)) {
    options.push({ label: name, value: id });
  }
  return options;
}

export function isEmpty(obj) {
  if (!obj) return true;

  if (typeof obj === "string") {
    if (obj === "") return true;
    return false;
  }

  if (typeof obj === "number") {
    return false;
  }

  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }
  return true;
}

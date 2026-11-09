import observe from "@lib/helpers/observer";

observe(document.querySelectorAll(".tabs-block"), async (element) => {
  await import("@lib/tabs").then((module) => {
    module.default(element);
  });
});

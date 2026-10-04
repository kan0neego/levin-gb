import observe from "@lib/helpers/observer";

observe(document.querySelectorAll(".video-autoplay"), async (element) => {
  await import("@lib/autoplay").then((module) => {
    module.default(element);
  });
});


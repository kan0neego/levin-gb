import observe from "@lib/helpers/observer";

observe(document.querySelectorAll(".video-autoplay"), async (element) => {
  await import("@lib/autoplay").then((module) => {
    module.default(element);
  });
});

observe(document.querySelectorAll("[data-fancybox]"), async (element) => {
  await import("@lib/fancybox").then((module) => {
    module.default(element);
  });
});

import observe from "@lib/helpers/observer";
import bindVideoProgress from "@lib/video-progress";

observe(document.querySelectorAll(".video-autoplay"), async (element) => {
  await import("@lib/autoplay").then((module) => {
    module.default(element);
  });
});

observe(document.querySelectorAll(".video-background"), (element) => {
  bindVideoProgress(element);
});

observe(document.querySelectorAll("[data-fancybox]"), async (element) => {
  await import("@lib/fancybox").then((module) => {
    module.default(element);
  });
});

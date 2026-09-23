import observe from "@lib/helpers/observer";

observe(document.querySelectorAll(".slider-container"), async (element) => {
	await import("@lib/slider/slider-init").then((module) => {
		module.default(element);
	});
});

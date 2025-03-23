import {pixi} from "../../../utils/scene/utils/import/import-pixi";

export async function customGsap(spaceId) {
  const {default: gsap} = await import("gsap");

  global.gsap = gsap;

  if (typeof spaceId !== "string") return;

  const {default: LocalTimeline} = await import ("../../../utils/gsap/LocalTimeline");

  const localTimeline = gsap.localTimeline = new LocalTimeline();

  localTimeline.createSpace(spaceId);
}

export async function tetrisPixiImports(spaceId) {
  await customGsap(spaceId);
  await pixi();
}

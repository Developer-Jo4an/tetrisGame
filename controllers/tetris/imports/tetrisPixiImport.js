import {pixi} from "../../../utils/scene/utils/import/import-pixi";

export async function customGsap(timelineSpace) {
  const {default: gsap} = await import("gsap");

  gsap.localTimelineStatuses = {
    ...(gsap.localTimelineStatuses ?? {}),
    [timelineSpace]: "playing"
  };

  gsap.localTimeline = gsap.localTimeline ?? (gsap.localTimeline = {
    clear(timeline) {
      gsap.localTimelines[timeline]?.forEach?.(tween => tween?.kill?.());
      gsap.localTimelines[timeline] && delete gsap.localTimelines[timeline];
    },
    pause(timeline) {
      gsap.localTimelines[timeline] && gsap.localTimelines[timeline].forEach(tween => tween?.pause?.());
      gsap.localTimelineStatuses[timelineSpace] = "paused";
    },
    play(timeline) {
      gsap.localTimelines[timeline] && gsap.localTimelines[timeline].forEach(tween => tween?.play?.());
      gsap.localTimelineStatuses[timelineSpace] = "playing";
    }
  });

  const createTweenMethods = ["to", "from", "fromTo", "set", "delayedCall"];

  const originalMethods = {};

  createTweenMethods.forEach(method => {
    originalMethods[method] = gsap[method];
    gsap[method] = function () {
      const tween = originalMethods[method].call(this, ...arguments);
      tween[({paused: "pause", playing: "play"})[gsap.localTimelineStatuses.timelineSpace]]?.();
      const timelines = gsap.localTimelines ?? (gsap.localTimelines = {});
      const currentTimeline = timelines[timelineSpace] ?? (gsap.localTimelines[timelineSpace] = []);
      currentTimeline.push(tween);
      console.log(`${timelineSpace} space add tween:`, tween);
      return tween;
    };
  });

  global.gsap = gsap;
}

export async function tetrisPixiImports(timelineSpace) {
  await customGsap(timelineSpace);
  await pixi();
}

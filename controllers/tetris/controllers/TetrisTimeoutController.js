import BaseTetrisController from "./BaseTetrisController";

export default class TetrisTimeoutController extends BaseTetrisController {
  constructor(data) {
    super(data);

    this.initProperties();
    this.init();
  }

  initProperties() {
    this.timeoutTween = null;
  }

  init() {
    const {gameData: {timeout}} = this.storage.mainSceneSettings.levels[this.level.value];

    if (typeof timeout !== "number") return;

    this.eventBus.dispatchEvent({type: "timeout:update", remainder: timeout});

    let currentTime = timeout;

    this.timeoutTween = gsap.to({}, {
      duration: timeout,
      onUpdate: () => {
        const progress = this.timeoutTween.progress();
        const remainder = Math.ceil(timeout - progress * timeout);
        if (currentTime !== remainder) {
          currentTime = remainder;
          this.eventBus.dispatchEvent({type: "timeout:update", remainder});
        }
      },
      onComplete: () => {
        this.timeoutTween.kill();
        this.lose();
      }
    });

    this.timeoutTween.pause();
  }

  playingSelect() {
    if (this.timeoutTween)
      this.timeoutTween.play();
  }

  resetSelect() {
    if (this.timeoutTween)
      this.timeoutTween.kill();

    this.initProperties();
    this.init();
  }
}

import BaseTetrisController from "./BaseTetrisController";
import TetrisFactory from "../helpers/TetrisFactory";

export default class TetrisGameController extends BaseTetrisController {
  constructor(data) {
    super(data);

    this.win = this.win.bind(this);
    this.lose = this.lose.bind(this);
    this.currentPointsAdd = this.currentPointsAdd.bind(this);

    this.initProperties();
    this.init();
  }

  initProperties() {
    this.timeoutTween = null;
    this.targetPoints = Number.MAX_VALUE;
    this.currentPoints = 0;
  }

  init() {
    this.initTimeout();
    this.initTargetPoints();
    this.toggleEvents("add");
  }

  initTimeout() {
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

  initTargetPoints() {
    const {gameData: {targetPoints}} = this.storage.mainSceneSettings.levels[this.level.value];

    if (typeof targetPoints !== "number") return;

    this.targetPoints = targetPoints;

    this.eventBus.dispatchEvent({type: "targetPoints:update", targetPoints});
    this.eventBus.dispatchEvent({type: "currentPoints:update", updatedCount: this.currentPoints});
  }

  toggleEvents(action) {
    const necessaryMethod = `${action}EventListener`;
    this.eventBus[necessaryMethod]("currentPoints:add", this.currentPointsAdd);
    this.eventBus[necessaryMethod]("game:win", this.win);
    this.eventBus[necessaryMethod]("game:lose", this.lose);
  }

  currentPointsAdd({addCount}) {
    this.currentPoints = Math.min(this.currentPoints + addCount, this.targetPoints);

    this.eventBus.dispatchEvent({type: "currentPoints:update", updatedCount: this.currentPoints});

    if (this.currentPoints === this.targetPoints)
      this.eventBus.dispatchEvent({type: "game:win"});
  }

  win() {
    this.eventBus.dispatchEvent({type: "game:won"});
  }

  lose() {
    this.eventBus.dispatchEvent({type: "game:lost"});
  }

  playingSelect() {
    if (this.timeoutTween)
      this.timeoutTween.play();
  }

  resetSelect() {
    if (this.timeoutTween)
      this.timeoutTween.kill();

    this.toggleEvents("remove");
    this.initProperties();
    this.init();

    const allEntitiesTypes = ["cell", "square", "squaresGroupView"];

    allEntitiesTypes.forEach(type => {
      const itemsByType = TetrisFactory.getCollectionByType(type) ?? [];
      itemsByType.forEach(item => item.destroy());
    });
  }
}

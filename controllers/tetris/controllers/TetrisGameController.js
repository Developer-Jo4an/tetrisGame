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
    this.targetPoints = Number.MAX_VALUE;
    this.currentPoints = 0;
  }

  init() {
    this.initTargetPoints();
    this.toggleEvents("add");
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

  resetSelect() {
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

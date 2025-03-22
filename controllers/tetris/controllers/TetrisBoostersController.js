import BaseTetrisController from "./BaseTetrisController";
import TetrisFactory from "../helpers/TetrisFactory";

export default class TetrisBoostersController extends BaseTetrisController {
  constructor(data) {
    super(data);

    this.boosterChange = this.boosterChange.bind(this);
    this.boosterChange = this.throwBooster.bind(this);

    this.initProperties();
    this.init();
    this.toggleEvents("add");
  }

  initProperties() {
    this.boosters = null;
    this.activeBooster = null;
  }

  init() {
    const {level, storage: {mainSceneSettings: {levels}}, eventBus} = this;

    const {boosters} = levels[level.value];

    this.boosters = boosters;

    eventBus.dispatchEvent({type: "boosters:installed", boosters: this.boosters});
  }

  toggleEvents(action) {
    const {eventBus} = this;

    const method = `${action}EventListener`;

    eventBus[method]("booster:change", this.boosterChange);
  }

  boosterChange({booster}) {
    const action = booster !== "reset" ? "on" : "off";

    this.activeBooster = ({on: booster, off: null})[action];

    const gridArea = TetrisFactory.getItemById("gridArea", "gridArea");

    gridArea.view.interactive = ({on: true, off: false})[action];

    const events = ["click", "tap"];

    events.forEach(event => ["off", action].forEach(action => gridArea.view[action](event, this.throwBooster)));
  };

  throwBooster() {
    this.boosterChange({booster: "reset"});
  };
}

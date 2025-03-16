import PixiController from "../../utils/scene/containers/PixiController";
import TetrisAreaController from "./controllers/TetrisAreaController";
import TetrisSpawnAreaController from "./controllers/TetrisSpawnAreaController";
import TetrisGameController from "./controllers/TetrisGameController";
import TetrisTimeoutController from "./controllers/TetrisTimeoutController";
import TetrisBoostersController from "./controllers/TetrisBoostersController";

export const GAME_SIZE = {width: 720, height: 1280};

export default class TetrisController extends PixiController {

  static CONTROLLERS = [
    TetrisGameController,
    TetrisTimeoutController,
    TetrisAreaController,
    TetrisSpawnAreaController,
    TetrisBoostersController
  ];

  controllers = [];

  constructor(data) {
    super(data);

    this.update = this.update.bind(this);
  }

  loadManifestSelect() {
    return !this.isLoadedManifest && super.loadManifestSelect().then(() => this.isLoadedManifest = true);
  }

  loadingSelect() {
    return !this.isLoaded && super.loadingSelect().then(() => this.isLoaded = true);
  }

  initializationControllersSelect() {
    const {eventBus, renderer, canvas, stage, storage, state, level} = this;
    const controllerData = {eventBus, renderer, canvas, stage, storage, state, level};
    this.controllers = TetrisController.CONTROLLERS.map(ControllerCls => new ControllerCls(controllerData));
  }

  initializationSelect() {
    this.app.ticker.add(this.update);
    this.setPause(false);
  }

  pauseSelect() {
    this.setPause(true);
  }

  winSelect() {
    this.setPause(true);
  }

  loseSelect() {
    this.setPause(true);
  }

  resetSelect() {
    this.app.ticker.remove(this.update);
  }

  setPause(isPause) {
    gsap.globalTimeline[isPause ? "pause" : "play"]();
    this.app.ticker[isPause ? "stop" : "start"]();
  }

  setLevel(level) {
    if (this.level) {
      this.level.value = level;
      return;
    }

    this.level = {value: level};
  }

  update(deltaTime) {
    const milliseconds = deltaTime * (1000 / 60);
    this.controllers.forEach(controller => controller?.update?.(milliseconds, deltaTime));
  }

  onResize({width, height} = this._size) {
    super.onResize({width, height});
    this._size = {width, height};
    const scale = Math.min(width / GAME_SIZE.width, height / GAME_SIZE.height);
    this.stage.scale.set(scale);
    this.stage.position.set(
      (width - GAME_SIZE.width * scale) / 2,
      (height - GAME_SIZE.height * scale) / 2
    );
  }
}

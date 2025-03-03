import BaseEntity from "./BaseEntity";
import TetrisFactory from "../helpers/TetrisFactory";

export default class SquaresGroupView extends BaseEntity {
  constructor(data) {
    super(data, "squaresGroupView");

    this.initProperties(data);
    this.init();
  }

  initProperties(data) {
    const {shape} = data;

    this.startShapes = shape;
    this.squares = [];
    this.isCanDoStep = false;
    this.underCells = [];
    this.selectionScale = null;
    this.isEnding = false;
    this.isDragging = false;
    this.startPosition = null;
    this.movePosition = null;
  }

  init() {
    const {levels, area} = this.storage.mainSceneSettings;

    const {grid} = levels[this.level.value];

    const container = this.view ?? (this.view = new PIXI.Container());
    container.name = `${this.name}-container`;
    container.alpha = 1;

    container.scale.set(1);

    this.normalizedPositions = (() => {
      const toNumberFormat = this.startShapes.map(item => item.split("-").map(Number));
      const minX = Math.min(...toNumberFormat.map(pos => pos[0]));
      const minY = Math.min(...toNumberFormat.map(pos => pos[1]));
      return toNumberFormat.map(([x, y]) => [x - minX, y - minY]);
    })();

    this.normalizedPositions.forEach(position => {
      const [xNormalized, yNormalized] = position;
      const id = `${xNormalized}-${yNormalized}`;

      const squareData = {
        id, grid, area, level: this.level, storage: this.storage, stage: this.stage, eventBus: this.eventBus
      };

      const square = TetrisFactory.createItem("square", squareData);

      this.squares.push(square);

      square.view.position.set(...[yNormalized, xNormalized].map(axis => axis * square.size + square.size / 2));

      container.addChild(square.view);
    });

    container.pivot.set(container.width / 2, container.height / 2);

    const hitArea = this.hitArea ?? (this.hitArea = new PIXI.Graphics());
    hitArea.name = "hitArea";
    hitArea.alpha = 1;

    hitArea.beginFill(0x00ff00, 0.1);
    hitArea.drawRect(0, 0, container.width, container.height);
    hitArea.endFill();

    container.addChild(hitArea);
  }

  setSelectionScale(scale) {
    this.selectionScale = scale;
    this.view.scale.set(this.selectionScale);
  }

  setInteractive(isInteractive) {
    this.view.interactive = isInteractive;

    const method = isInteractive ? "on" : "off";

    this.view[method]("pointerdown", this.onStart);
    this.view[method]("pointermove", this.onMove);
    this.view[method]("pointerup", this.onEnd);
    this.view[method]("pointerupoutside", this.onEnd);
  }

  onStart = e => {
    if (this.isEnding) return;

    this.isDragging = true;
    this.setActive(true);
    const {x, y} = e.data.global;
    this.startPosition = {x: this.view.x, y: this.view.y};
    this.movePosition = {x, y};
  };

  onMove = e => {
    if (!this.isDragging) return;

    const {x, y} = e.data.global;
    const [xDiff, yDiff] = [x - this.movePosition.x, y - this.movePosition.y].map(diff => diff / this.stage.scale.x);
    this.movePosition = {x, y};
    this.view.position.set(this.view.x + xDiff, this.view.y + yDiff);
    this.setPossibleStepModeToCell([]);
    this.checkCorrectStep();
    this.setPossibleStepModeToCell(this.underCells);
  };

  onEnd = e => {
    if (!this.isDragging) return;

    this.isEnding = true;
    this.isDragging = false;

    this[`${this.isCanDoStep ? "doStep" : "setInactive"}`]();
  };

  clearDraggingData() {
    this.isEnding = false;
    this.startPosition = null;
    this.movePosition = null;
  }

  doStep() {
    this.setPossibleStepModeToCell([]);
    this.underCells.forEach((cell, index) => cell.addSquare(this.squares[index]));
    this.isCanDoStep = false;
    this.underCells = [];
    this.destroy();
    this.eventBus.dispatchEvent({type: "step:stepped"});
  }

  setInactive() {
    const scaleTweenPromise = this.setActive(false);

    const positionTweenPromise = new Promise(res =>
      gsap.to(this.view, {
        x: this.startPosition.x,
        y: this.startPosition.y,
        duration: 0.2,
        ease: "sine.inOut",
        onComplete: res
      }));

    Promise.all([scaleTweenPromise, positionTweenPromise]).then(this.clearDraggingData.bind(this));
  }

  setActive(isActive) {
    const timeline = gsap.timeline();

    timeline
    .to(this.view.scale, {
      x: isActive ? 1 : this.selectionScale,
      y: isActive ? 1 : this.selectionScale,
      duration: 0.1,
      ease: "sine.inOut"
    })
    .to(this.hitArea, {
      alpha: +!isActive,
      duration: 0.1,
      ease: "sine.inOut"
    }, 0);

    return new Promise(res => timeline.eventCallback("onComplete", res));
  }

  setPossibleStepModeToCell(possibleCells) {
    const cells = TetrisFactory.getCollectionByType("cell");
    cells.forEach(cell => {
      const isPossible = possibleCells.includes(cell);
      !cell.isDisabledCell && cell.setMode(isPossible ? "possibleStep" : "standard");
    });
  }

  checkCorrectStep() {
    const cells = TetrisFactory.getCollectionByType("cell");

    const underCells = this.squares.reduce((acc, square) => {
      const squarePosition = square.view.getGlobalPosition();

      const underCell = cells.find(cell => {
        const cellPosition = cell.view.getGlobalPosition();

        const [distanceX, distanceY] = ["x", "y"].map(axis =>
          Math.abs(cellPosition[axis] - squarePosition[axis]) / this.stage.scale[axis]
        );

        return distanceX <= cell.view.width / 2 && distanceY <= cell.view.height / 2;
      });

      return (!underCell || underCell.isDisabledCell || !!underCell.getSquare()) ? acc : [...acc, underCell];
    }, []);

    this.isCanDoStep = underCells.length === this.squares.length;
    this.underCells = this.isCanDoStep ? underCells : [];
  }

  reset(data) {
    super.reset(data);
    this.initProperties(data);
    this.init();
  }

  destroy() {
    this.setInteractive(false);
    this.squares = [];
    this.hitArea.clear();
    super.destroy();
  }
}

import BaseTetrisController from "./BaseTetrisController";
import {GAME_SIZE} from "../TetrisController";
import TetrisFactory from "../helpers/TetrisFactory";
import {shuffle} from "../../../utils/scene/utils/random/shuffle";

export default class TetrisAreaController extends BaseTetrisController {
  constructor(data) {
    super(data);

    this.init();
  }

  init() {
    const gridContainerData = {
      id: "gridArea", level: this.level, storage: this.storage, stage: this.stage, eventBus: this.eventBus
    };

    TetrisFactory.createItem("gridArea", gridContainerData);
  }

  initializationSelect() {
    this.initGrid();
    this.initSquares();
  }

  resetSelect() {
    const gridArea = TetrisFactory.getItemById("gridArea", "gridArea");

    gridArea.clear();
  }

  showingSelect() {
    const {levels} = this.storage.mainSceneSettings;

    const {startHideCellsMultiplier} = levels[this.level.value];

    const cells = TetrisFactory.getCollectionByType("cell");

    const shuffledCells = shuffle([...cells]);

    const {shuffledViews, shuffledScales} = shuffledCells.reduce((acc, cell) => {
      cell.isVisibleCell && acc.shuffledViews.push(cell.view);
      acc.shuffledScales.push(cell.view.scale);
      return acc;
    }, {shuffledViews: [], shuffledScales: []});

    const hideSquaresCount = Math.floor(startHideCellsMultiplier * cells?.length);

    const hideSquares = (() => {
      const arr = [];
      const squares = TetrisFactory.getCollectionByType("square");

      while (arr.length < hideSquaresCount) {
        const randomEl = squares[Math.floor(Math.random() * squares.length)];

        if (!arr.includes(randomEl))
          arr.push(randomEl);
      }

      return arr;
    })();

    const showingTimeline = gsap.timeline();

    const onComplete = res => {
      showingTimeline.kill();
      res();
    };

    showingTimeline.to(shuffledViews, {
      alpha: 1,
      delay: i => i * 0.01,
      duration: 0.2,
      ease: "ease.inOut"
    }).to(shuffledScales, {
      x: 1, y: 1,
      delay: i => i * 0.01,
      duration: 0.2,
      ease: "ease.inOut"
    }).to(hideSquares.map(square => square.view), {
      alpha: 0,
      delay: i => i * 0.01,
      duration: 0.2,
      ease: "ease.inOut",
      onComplete: () => {
        hideSquares.forEach(square => square.destroy());
      }
    });

    return new Promise(res => showingTimeline.eventCallback("onComplete", () => onComplete(res)));
  }

  initGrid() {
    const {storage: {mainSceneSettings: {levels, area}}, level, eventBus, storage, stage} = this;

    const {grid} = levels[this.level.value];

    const gridArea = TetrisFactory.getItemById("gridArea", "gridArea");

    grid.forEach(({cells}, row) => cells.forEach((cell, column) => {
      const cellData = {
        row, column, level, cell, storage, stage, eventBus, grid, area
      };

      const cellItem = TetrisFactory.createItem("cell", cellData);

      const [x, y] = [column, row].map(axes => (axes * cellItem.size) + (cellItem.size / 2));

      cellItem.view.position.set(x, y);
      cellItem.view.alpha = 0;

      gridArea.addCell(cellItem.view);
    }));

    const {view: gridView} = gridArea;

    gridView.position.x = (GAME_SIZE.width - gridView.width) / 2;

    TetrisFactory.getCollectionByType("cell").forEach(cell => cell.view.scale.set(0));

    this.stage.addChild(gridView);
  }

  initSquares() {
    const {storage: {mainSceneSettings: {levels, area}}} = this;

    const {grid} = levels[this.level.value];

    const cells = TetrisFactory.getCollectionByType("cell");

    cells.forEach(cell => {
      if (cell.isDisabledCell) return;

      const squareData = {
        id: cell.id, area, grid,
        stage: this.stage,
        level: this.level,
        storage: this.storage,
        eventBus: this.eventBus
      };

      cell.addSquare(TetrisFactory.createItem("square", squareData));
    });
  }

  playingSelect() {

  }

  update(milliseconds, deltaTime) {

  }
}

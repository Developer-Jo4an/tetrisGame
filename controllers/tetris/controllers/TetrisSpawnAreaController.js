import BaseTetrisController from "./BaseTetrisController";
import TetrisFactory from "../helpers/TetrisFactory";
import {getRandomFromRange} from "../../../utils/data/random/getRandomFromRange";
import {GAME_SIZE} from "../TetrisController";
import {shuffle} from "../../../utils/scene/utils/random/shuffle";
import {globalUtils} from "../utils/globalUtils";

export default class TetrisSpawnAreaController extends BaseTetrisController {
  constructor(data) {
    super(data);

    this.stepped = this.stepped.bind(this);

    this.initProperties();
    this.init();
  }

  initProperties() {
    this.step = 0;
  }

  init() {
    const spawnGroupAreaData = {
      id: "spawnArea", level: this.level, storage: this.storage, stage: this.stage, eventBus: this.eventBus
    };

    TetrisFactory.createItem("spawnArea", spawnGroupAreaData);
  }

  initializationSelect() {
    this.toggleEvents("add");
  }

  playingSelect() {
    this.generateSquaresGroupArray();
  }

  resetSelect() {
    this.initProperties(0);
    this.toggleEvents("remove");

    const squareArea = TetrisFactory.getItemById("spawnArea", "spawnArea");

    squareArea.clear();
  }

  toggleEvents(action) {
    const method = `${action}EventListener`;
    this.eventBus[method]("step:stepped", this.stepped);
  }

  isCellEmpty(cell) {
    return cell && !cell.isDisabledCell && !Boolean(cell.getSquare());
  }

  cellsToGrid() {
    const cells = TetrisFactory.getCollectionByType("cell");

    return cells.reduce((acc, cell) => {
      const {row, column} = cell.getPosById();
      if (!acc[row]) acc[row] = [];
      acc[row][column] = cell;
      return acc;
    }, []);
  }

  getPercentSquareCount() {
    const cells = TetrisFactory.getCollectionByType("cell");
    const squares = TetrisFactory.getCollectionByType("square");
    //todo: в константы разброс
    return Math.ceil((cells.length - squares.length) * getRandomFromRange(0.25, 0.4));
  }

  getShapesCountVariants(percentSquareCount) {
    const {spawnArea: {spawnSettings: {ranges}}} = this.storage.mainSceneSettings;

    return ranges.reduce((acc, [minCount, squareCount]) =>
        percentSquareCount >= minCount ? [squareCount, ...acc] : acc
      , [1]);
  }

  generateSquaresGroupArray() {
    const {spawnArea: {spawnSettings: {directions}}} = this.storage.mainSceneSettings;

    const cells = TetrisFactory.getCollectionByType("cell");

    const percentSquareCount = this.getPercentSquareCount();

    const shapesCounts = this.getShapesCountVariants(percentSquareCount);

    const grid = this.cellsToGrid();

    const totalShapes = [];

    shapesCounts.forEach(count => {
      if (totalShapes.length) return;

      const allShapeCombinations = globalUtils.generateNumberPairs(percentSquareCount, count);

      let isPossibleCombination = false;

      const shuffledCombinations = shuffle([...allShapeCombinations]);

      shuffledCombinations.forEach(combination => {
        if (isPossibleCombination) return;

        const shuffledCells = shuffle([...cells]);

        const reservedShapes = [];

        let isNecessaryFigure = true;

        const shuffleCombination = shuffle([...combination]);

        shuffleCombination.forEach(shapeCount => {
          if (!isNecessaryFigure) return;

          const shapeArr = [];

          reservedShapes.push(shapeArr);

          const checkOnComplete = () => shapeArr?.length === shapeCount;

          let isPossibleShape = false;

          shuffledCells.forEach(cell => {
            if (!this.isCellEmpty(cell) || isPossibleShape) return;

            const recurse = ({row, column}) => {
              if (checkOnComplete()) return;

              const allFigures = reservedShapes.flat(Number.MAX_VALUE);

              const cellId = `${row}-${column}`;

              if (!allFigures.includes(cellId)) {
                shapeArr.push(cellId);
                if (checkOnComplete()) return;
              } else return;

              const shuffledDirections = shuffle([...directions]);

              shuffledDirections.forEach(([y, x]) => {
                if (checkOnComplete()) return;
                const [modifiedY, modifiedX] = [y + row, x + column];
                const necessaryCell = grid[modifiedY]?.[modifiedX];
                const id = `${modifiedY}-${modifiedX}`;
                if (this.isCellEmpty(necessaryCell) && !reservedShapes.flat(Number.MAX_VALUE).includes(id))
                  recurse({row: modifiedY, column: modifiedX});
              });
            };

            recurse(cell.getPosById());

            const cellResult = checkOnComplete();

            cellResult ? (isPossibleShape = true) : (shapeArr.length = 0);
          });

          if (!isPossibleShape) isNecessaryFigure = false;
        });

        console.log(reservedShapes);

        console.log("dwqdqwdwfwfwfwfwf");

        if (isNecessaryFigure) {
          totalShapes.push(...reservedShapes);
          isPossibleCombination = true;
        }
      });

      if (!isPossibleCombination)
        this.generateSquaresGroupArray();
    });

    this.createShapesGroupView(totalShapes);
  }

  createShapesGroupView(shapes) {
    shapes.forEach((shape, index) => {
      const id = `${this.step}:${index}`;
      const squaresGroupData = {
        id, shape, level: this.level, stage: this.stage, storage: this.storage, eventBus: this.eventBus
      };
      TetrisFactory.createItem("squaresGroupView", squaresGroupData);
    });

    this.exposeSquaresGroupView();
  }

  exposeSquaresGroupView() {
    const {spawnArea: {distanceBetweenArea}, area: {margin}} = this.storage.mainSceneSettings;

    const gridArea = TetrisFactory.getItemById("gridArea", "gridArea");
    const spawnGroupArea = TetrisFactory.getItemById("spawnArea", "spawnArea");
    const shapeGroups = TetrisFactory.getCollectionByType("squaresGroupView");

    shapeGroups.forEach(({startShapes}) => console.log(startShapes));
    console.log("-------------------------");
    shapeGroups.forEach(({normalizedPositions}) => console.log(normalizedPositions));
    console.log("////////////////////////////////////////////////////////////////");

    const maxHeight = GAME_SIZE.height - gridArea.view.height - distanceBetweenArea - margin;
    const maxWidth = GAME_SIZE.width - (margin * 2) - ((shapeGroups.length - 1) * margin);

    const {widthValue, heightValue} = shapeGroups.reduce((acc, {view}) => {
      const {height, width} = view;
      const {widthValue, heightValue} = acc;
      return {widthValue: widthValue + width, heightValue: Math.max(heightValue, height)};
    }, {widthValue: 0, heightValue: 0});

    const shapeScale = Math.min(maxWidth / widthValue, maxHeight / heightValue);

    shapeGroups.forEach((shapeGroup, index, arr) => {
      const {view} = shapeGroup;
      shapeGroup.setSelectionScale(shapeScale);
      const prevEls = arr.slice(0, index);
      const x = prevEls.reduce((acc, {view}) => acc + view.width + margin, view.width / 2);
      const y = view.height / 2;
      view.position.set(x, y);
      spawnGroupArea.addShape(view);
      view.alpha = 0;
    });

    const {view: spawnGroupView} = spawnGroupArea;

    shapeGroups.forEach(({view}) => view.position.y = spawnGroupView.height / 2);

    spawnGroupView.pivot.set(spawnGroupView.width / 2, 0);
    spawnGroupView.position.set(GAME_SIZE.width / 2, gridArea.view.height + distanceBetweenArea);

    this.stage.addChild(spawnGroupView);

    const shapeViews = shapeGroups.map(({view}) => view);

    const tween = gsap.to(shapeViews, {
      alpha: 1,
      duration: 0.3,
      ease: "sine.out",
      onComplete: () => {
        tween.kill();
        shapeGroups.forEach(shapeGroup => shapeGroup.setInteractive(true));
      }
    });
  }

  setInteractiveShapes(isInteractive) {
    const shapeGroups = TetrisFactory.getCollectionByType("squaresGroupView");
    shapeGroups.forEach(shape => shape.setInteractive(isInteractive));
  }

  async stepped() {
    const shapeGroups = TetrisFactory.getCollectionByType("squaresGroupView");

    this.setInteractiveShapes(false);

    await this.checkOnAddPoints();

    const isLose = shapeGroups?.length && this.checkLose();

    if (isLose) {
      const tween = gsap.to({}, {
        duration: 1,
        onComplete: () => {
          tween.kill();
          this.eventBus.dispatchEvent({type: "game:lose"});
        }
      });
      return;
    }

    shapeGroups.length
      ? this.setInteractiveShapes(true)
      : this.generateSquaresGroupArray();
  }

  checkOnAddPoints() {
    const fullRowsCellIds = this.checkColumnOrRow("row");
    const fullColumnsCellIds = this.checkColumnOrRow("column");

    const allUniqSquares = [...new Set([...fullColumnsCellIds, ...fullRowsCellIds])];

    if (!allUniqSquares.length)
      return Promise.resolve();

    const cells = TetrisFactory.getCollectionByType("cell");

    const necessaryCells = cells.filter(({id}) => allUniqSquares.includes(id));

    const squares = necessaryCells.map(cell => cell.getSquare());

    const shuffledSquaresViews = shuffle(squares.map(({view}) => view));

    const tween = gsap.to(shuffledSquaresViews, { //todo: в константы delay
      alpha: 0,
      delay: i => 0.3 + (i * 0.05),
      duration: 0.3,
      ease: "sine.inOut"
    });

    const onEndHideAnimation = res => {
      tween.kill();
      squares.forEach(square => square.destroy());
      this.eventBus.dispatchEvent({type: "currentPoints:add", addCount: squares?.length});
      res();
    };

    return new Promise(res => tween.eventCallback("onComplete", () => onEndHideAnimation(res)));
  }

  checkColumnOrRow(side) {
    const cells = this.cellsToGrid();

    const length = side === "row" ? cells.length : cells[0].length;

    const completed = [];

    for (let counter = 0; counter < length; counter++) {
      let isSideComplete = true;

      const subLength = side === "row" ? cells[counter].length : cells.length;

      for (let subCounter = 0; subCounter < subLength; subCounter++) {
        const [index, subIndex] = [side === "row" ? counter : subCounter, side === "row" ? subCounter : counter];

        const necessaryCell = cells[index][subIndex];

        if (necessaryCell.isDisabledCell) continue;

        if (!necessaryCell.getSquare()) {
          isSideComplete = false;
          break;
        }
      }

      if (isSideComplete)
        ({
          row: () => {
            completed.push(...(cells[counter].reduce((acc, cell) => {
              return cell.isDisabledCell ? acc : [...acc, cell.id];
            }, [])));
          },
          column: () => {
            for (let row = 0; row < cells.length; row++) {
              const necessaryCell = cells[row][counter];
              !necessaryCell.isDisabledCell && completed.push(necessaryCell.id);
            }
          }
        })[side]();
    }

    return completed;
  }

  checkLose() {
    const groups = TetrisFactory.getCollectionByType("squaresGroupView");

    const cells = TetrisFactory.getCollectionByType("cell");

    const groupShapes = groups.map(({squares}) => squares.reduce((acc, square) => [...acc, square.getPosById()], []));

    return !groupShapes.some(shape => {
      return cells.some(cell => {
        const {row: cellRow, column: cellColumn} = cell.getPosById();

        const necessaryCells = shape.reduce((acc, {row, column}) => {
          const necessaryId = `${cellRow + row}-${cellColumn + column}`;
          return [...acc, cells.find(cell => cell.id === necessaryId)];
        }, []);

        return necessaryCells.every(cell => this.isCellEmpty(cell));
      });
    });
  }

  update(deltaTime) {
  }
}

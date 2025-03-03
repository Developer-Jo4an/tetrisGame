import {globalUtils} from "../utils/globalUtils";
import {GAME_SIZE} from "../TetrisController";
import Cell from "../entites/Cell";
import Square from "../entites/Square";
import SquaresGroupView from "../entites/SquaresGroupView";

//todo: надо было синглтоном, а не статиком, потом поправить :(
export default class TetrisFactory {
  static library = {};
  static reusedLibrary = {};

  //create
  static createItem(type, data, extraProps = {}) {
    //extraProps в случае, если данные могут быть НЕ одинаковыми при периспользовании и требуется динамический расчет
    const createLogic = {
      cell: () => {
        const {row, column, level, grid, area, cell: cellType, storage, stage, eventBus} = data;

        const id = `${row}-${column}`;
        // cell: true | false | "empty": true - непустая, false - отсутствие, empty - пустая
        const status = ({"false": "dontExist", "empty": "empty", "true": "standard"})[cellType];
        const name = `cell:${id}`;
        const size = globalUtils.getCellSize({gameSize: GAME_SIZE, grid, margin: area.margin});

        const cellCreateData = {
          id, level, status, size, storage, stage, eventBus, name
        };

        const {isFindReused, item} = TetrisFactory.returnReusedItem(type, cellCreateData);

        if (isFindReused)
          return item;

        const newCell = new Cell(cellCreateData);
        TetrisFactory.setItemByType(type, newCell);
        return newCell;
      },
      square: () => {
        const {id, level, storage, stage, eventBus, grid, area} = data;

        const name = `square:${id}`;

        const size = globalUtils.getCellSize({gameSize: GAME_SIZE, grid, margin: area.margin});

        const squareCreateData = {
          id, name, level, storage, stage, eventBus, size
        };

        const {isFindReused, item} = TetrisFactory.returnReusedItem(type, squareCreateData);

        if (isFindReused)
          return item;

        const newSquare = new Square(squareCreateData);
        TetrisFactory.setItemByType(type, newSquare);
        return newSquare;
      },
      squaresGroupView: () => {
        const {id, shape, level, stage, storage, eventBus} = data;

        const name = `squaresGroupView:${id}`;

        const squaresGroupViewCreateData = {
          id, shape, level, stage, storage, eventBus, name
        };

        const {isFindReused, item} = TetrisFactory.returnReusedItem(type, squaresGroupViewCreateData);

        if (isFindReused)
          return item;

        const newSquaresGroupView = new SquaresGroupView(squaresGroupViewCreateData);
        TetrisFactory.setItemByType(type, newSquaresGroupView);
        return newSquaresGroupView;
      }
    };

    const createCallback = createLogic[type];

    if (typeof createCallback !== "function")
      throw new Error("Type not found");

    return createCallback();
  }

  static returnReusedItem(type, data) {
    const reusedCollection = TetrisFactory.getReusedCollectionByType(type) ?? [];

    const reusedItem = reusedCollection.pop();

    if (reusedItem) {
      reusedItem.reset(data);
      TetrisFactory.setItemByType(type, reusedItem);
      return {isFindReused: true, item: reusedItem};
    }

    return {isFindReused: false};
  }


  //getters
  static getItemById(type, id) {
    if (!TetrisFactory.library[type]) return;
    return TetrisFactory.library[type].find(({id: itemId}) => itemId === id);
  }

  static getReusedCollectionByType(type) {
    return TetrisFactory.reusedLibrary[type];
  }

  static getCollectionByType(type) {
    return TetrisFactory.library[type];
  }

  static getLibrary() {
    return TetrisFactory.library;
  }


  //setters
  static setItemByType(type, entity) {
    if (!TetrisFactory.library[type])
      TetrisFactory.library[type] = [];

    if (TetrisFactory.library[type].includes(entity))
      throw new Error("This entity already exist");

    TetrisFactory.library[type].push(entity);
  }

  setCollectionByType(type, collection) {
    TetrisFactory.library[type] = collection;
  }


  //clear
  static clearItemByEntity(type, entity) {
    TetrisFactory.library[type] = TetrisFactory.library[type].filter(item => item !== entity);

    const reusedItems = TetrisFactory.reusedLibrary[type] ?? (TetrisFactory.reusedLibrary[type] = []);

    if (reusedItems.includes(entity))
      throw new Error("This entity already exist");

    reusedItems.push(entity);
  }

  static clear() {
    TetrisFactory.library = {};
    TetrisFactory.reusedLibrary = {};
  }
}

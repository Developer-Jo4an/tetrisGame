import BaseEntity from "./BaseEntity";
import AssetsManager from "../../../utils/scene/loader/plugins/AssetsManager";

export default class Cell extends BaseEntity {

  static availableCellStatuses = ["standard"];

  static visibleCellStatuses = ["standard", "empty"];

  static mods = ["standard", "possibleStep"];


  _status;

  _isDisabledCell;

  _isVisibleCell;

  _mode;

  _size;

  constructor(data, type) {
    super(data, type);

    this.initProperties(data);
    this.init();
  }

  get size() {
    return this._size;
  }

  set size(value) {
    this._size = value;
  }

  get status() {
    return this._status;
  }

  set status(value) {
    this._status = value;
  }

  get isDisabledCell() {
    return this._isDisabledCell;
  }

  set isDisabledCell(value) {
    this._isDisabledCell = value;
  }

  get isVisibleCell() {
    return this._isVisibleCell;
  }

  set isVisibleCell(value) {
    this._isVisibleCell = value;
  }

  get mode() {
    return this._mode;
  }

  set mode(value) {
    if (!Cell.mods.includes(value))
      throw new Error("this mode don't exist");

    this._mode = value;
  }

  initProperties(data) {
    const {status, size} = data;

    this.size = size;
    this.status = status;
    this.isDisabledCell = !Cell.availableCellStatuses.includes(this.status);
    this.isVisibleCell = Cell.visibleCellStatuses.includes(this.status);
    this.mode = "standard";

    this.square = null;
  }

  init() {
    const spriteTexture = AssetsManager.getAssetFromLib(`cell-${this.status}`, "texture");

    const cellSprite = this.cellSprite ?? (this.cellSprite = new PIXI.Sprite());
    cellSprite.texture = spriteTexture;
    cellSprite.scale.set(1);
    cellSprite.scale.set(this.size / cellSprite.width, this.size / cellSprite.height);

    cellSprite.name = `${this.name}-sprite`;
    cellSprite.alpha = 1;


    const container = this.view ?? (this.view = new PIXI.Container());

    container.removeChildren();

    container.name = this.name;
    container.alpha = 1;
    container.addChild(cellSprite);
    container.pivot.set(cellSprite.width / 2, cellSprite.height / 2);
  }

  addSquare(square) {
    if (this.isDisabledCell)
      throw new Error("incorrect status");

    this.square = square;
    square.id = this.id;
    square.name = `square:${square.id}`;
    square.view.name = `square:${square.id}-sprite`;
    square.view.position.set(square.view.width / 2, square.view.height / 2);
    this.view.addChild(square.view);
    this.square.setParentCell(this);
  }

  getSquare() {
    if (this.isDisabledCell)
      throw new Error("incorrect status");

    return this.square;
  }

  removeSquare() {
    if (this.isDisabledCell)
      throw new Error("incorrect status");

    if (!this.square)
      throw new Error("square don't exist");

    this.view.removeChild(this.square);
    this.square = null;
  }

  setMode(mode) {
    if (this.isDisabledCell)
      throw new Error("incorrect status");

    this.mode = mode;

    ({
      standard: () => {
        this.cellSprite.tint = 0xffffff;
      },
      possibleStep: () => {
        this.cellSprite.tint = 0xff0000; //todo: в константы цвет на данный mode
      }
    })[mode]();
  }

  reset(data) {
    super.reset(data);
    this.initProperties(data);
    this.init();
  }

  destroy() {
    const square = !this.isDisabledCell && this.getSquare();

    if (square) {
      square.destroy();
      this.view.removeChild(square);
      this.square = null;
    }

    super.destroy();
  }
}

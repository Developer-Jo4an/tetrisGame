import TetrisFactory from "../helpers/TetrisFactory";

export default class BaseEntity {

  _view;

  _id;

  _type;

  constructor(data, type) {
    this.initBaseProperties(data);

    this.type = type;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get view() {
    return this._view;
  }

  set view(value) {
    this._view = value;
  }

  initBaseProperties({id, level, storage, stage, eventBus, name}) {
    this.id = id;
    this.name = name;
    this.stage = stage;
    this.storage = storage;
    this.eventBus = eventBus;
    this.level = level;
  }

  init() {

  }

  getPosById() {
    try {
      const [row, column] = this.id.split("-").map(Number);
      return {row, column};
    } catch {
      return null;
    }
  }

  reset(data) {
    this.initBaseProperties(data);
  }

  destroy() {
    if (this.type)
      TetrisFactory.clearItemByEntity(this.type, this);
  }
}

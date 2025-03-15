import BaseEntity from "./BaseEntity";

export default class GridArea extends BaseEntity {
  constructor(data, type) {
    super(data, type);

    this.initProperties(data);
    this.init();
  }

  initProperties(data) {
  }

  init() {
    this.view = new PIXI.Container();
    this.view.name = this.name;
  }

  addCell(cellView) {
    this.view.addChild(cellView);
  }

  clear() {
    this.view.removeChildren();
  }
}

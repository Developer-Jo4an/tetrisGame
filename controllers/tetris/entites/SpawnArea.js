import BaseEntity from "./BaseEntity";

export default class SpawnArea extends BaseEntity {
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

  addShape(shapeView) {
    this.view.addChild(shapeView);
  }

  clear() {
    this.view.removeChildren();
  }
}

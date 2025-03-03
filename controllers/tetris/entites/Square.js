import BaseEntity from "../../../controllers/tetris/entites/BaseEntity";
import AssetsManager from "../../../utils/scene/loader/plugins/AssetsManager";

export default class Square extends BaseEntity {
  constructor(data) {
    super(data, "square");

    this.initProperties(data);
    this.init();
  }

  initProperties(data) {
    const {size} = data;

    this.size = size;

    this.cell = null;
  }

  init() {
    const {colors} = this.storage.mainSceneSettings.square;

    const texture = AssetsManager.getAssetFromLib("square", "texture");

    const sprite = this.view ?? (this.view = new PIXI.Sprite());
    sprite.texture = texture;
    sprite.scale.set(1);
    sprite.tint = Number(colors[Math.floor(Math.random() * colors.length)]);
    sprite.anchor.set(0.5);
    sprite.scale.set(this.size / sprite.width, this.size / sprite.height);
    sprite.position.set(sprite.width / 2, sprite.height / 2);

    sprite.name = `${this.name}-sprite`;
    sprite.alpha = 1;
  }

  setParentCell(cell) {
    this.cell = cell;
  }

  getParentCell() {
    return this.cell;
  }

  reset(data) {
    super.reset(data);
    this.initProperties(data);
    this.init();
  }

  destroy() {
    const parent = this.getParentCell();

    if (parent) {
      parent.removeSquare();
      this.cell = null;
    }

    super.destroy();
  }
}

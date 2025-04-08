export default class LocalTimeline {
  static statuses = {
    playing: "playing",
    paused: "paused"
  };

  _spaces = {};

  constructor() {
    if (LocalTimeline.instance)
      return LocalTimeline.instance;
    LocalTimeline.instance = this;

    this.register();
  }

  get spaces() {
    return this._spaces;
  }

  register() {
    const Animation = gsap.core.Animation;

    const self = this;

    Animation.prototype.save = function (namespace) {
      self.add(namespace, this);
      return this;
    };

    Animation.prototype.delete = function (namespace, toKill) {
      self.delete(namespace, this, toKill);
      return this;
    };
  }

  createSpace(namespace) {
    this.spaces[namespace] = {
      arr: [],
      status: LocalTimeline.statuses.playing
    };
  }

  setStatus(namespace, status) {
    this.spaces[namespace].status = status;
  }

  clear(namespace, toKill) {
    const tweens = this.getTweensByNamespace(namespace);
    toKill && tweens.forEach(tween => this.killTween(tween));
    this.spaces[namespace].arr = [];
  }

  add(namespace, tween) {
    const currentStatus = this.getStatusByNamespace(namespace);
    tween[({playing: "play", paused: "pause"})[currentStatus]]?.();
    const tweens = this.getTweensByNamespace(namespace);
    tweens.push(tween);
  }

  delete(namespace, tween, toKill) {
    const tweens = this.getTweensByNamespace(namespace);
    toKill && this.killTween(tween);
    tweens.filter(insideSpaceTween => insideSpaceTween !== tween);
  }

  pause(namespace) {
    const tweens = this.getTweensByNamespace(namespace);
    tweens.forEach(tween => tween.pause());
    this.setStatus(namespace, LocalTimeline.statuses.paused);
  }

  play(namespace) {
    const tweens = this.getTweensByNamespace(namespace);
    tweens.forEach(tween => tween.play());
    this.setStatus(namespace, LocalTimeline.statuses.playing);
  }

  killTween(tween) {
    if (tween.paused()) {
      console.warn(tween, "Twin that is paused cannot be killed.");
      tween.play();
    }

    if (tween.isKilled)
      console.warn(tween, "Twin that is killed cannot be killed.");

    tween.kill();
    tween.isKilled = true;
  }

  getTweensByNamespace(namespace) {
    return this.spaces[namespace]?.arr;
  }

  getStatusByNamespace(namespace) {
    return this.spaces[namespace]?.status;
  }
}

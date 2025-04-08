import State from "../../../utils/scene/decorators/state/State";

export default class TetrisState extends State {
  constructor(data) {
    super(data);
  }

  onStateChanged(state) {
    this._eventBus.dispatchEvent({type: "state-adapter:state-changed", data: {state}});

    this.statePromise = Promise.all([
      this._controller[`${state}Select`]?.call(this._controller) ?? Promise.resolve(),
      ...(this._controller.controllers ?? []).map(subController => {
        const asyncStateCallback = subController[`${state}Select`]?.call(subController);
        return asyncStateCallback ?? Promise.resolve();
      })
    ]);
  }
}

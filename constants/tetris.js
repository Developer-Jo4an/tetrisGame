export const stateMachine = {
  loadManifest: {availableStates: ["loading"], nextState: "loading", isDefault: true, isLoading: true},
  loading: {availableStates: ["initializationControllers"], nextState: "initializationControllers", isLoading: true},
  initializationControllers: {availableStates: ["initialization"], nextState: "initialization", isLoading: true},
  initialization: {availableStates: ["showing"], nextState: "showing", isLoading: true},
  showing: {availableStates: ["create"], nextState: "create"},
  create: {availableStates: ["playing"], nextState: "playing"},
  playing: {availableStates: ["pause", "win", "lose"]},
  win: {availableStates: ["reset"], nextState: "reset"},
  lose: {availableStates: ["reset"], nextState: "reset"},
  pause: {availableStates: ["playing", "reset"], nextState: ""},
  reset: {availableStates: ["initialization"], nextState: "initialization"}
};

export const ignoreNextState = ["playing", "win", "lose", "pause"];

export const tetrisTimelineSpaceId = "tetris"

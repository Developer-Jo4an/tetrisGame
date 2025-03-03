import {useEffect, useMemo, useRef, useState} from "react";
import {useLoadController} from "../../utils/scene/react/hooks/useLoadController";
import {basePixiImports} from "../../utils/scene/utils/import/import-pixi";
import useStateReducer from "../../utils/scene/react/hooks/useStateReducer";
import Loader from "../loader/Loader";
import {Stats} from "../stats/Stats";
import {useModal} from "../../hooks/useModal";

const stateMachine = {
  loadManifest: {availableStates: ["loading"], nextState: "loading", isDefault: true, isLoading: true},
  loading: {availableStates: ["initialization"], nextState: "initialization", isLoading: true},
  initialization: {availableStates: ["showing"], nextState: "showing", isLoading: true},
  showing: {availableStates: ["playing"], nextState: "playing"},
  playing: {availableStates: ["pause", "win", "lose"]},
  win: {availableStates: ["reset"], nextState: "reset"},
  lose: {availableStates: ["reset"], nextState: "reset"},
  pause: {availableStates: ["playing", "reset"], nextState: ""},
  reset: {availableStates: ["initialization"], nextState: "initialization"}
};

const ignoreNextState = ["playing", "win", "lose", "pause"];

const Scene = () => {
  const [wrapper, setWrapper] = useState();
  const [state, setState] = useState(Object.entries(stateMachine).find(([_, value]) => value.isDefault)[0]);
  const containerRef = useRef();
  const {addModal, closeModal} = useModal();

  const setStateCallback = newState => {
    if (!stateMachine[state].availableStates.includes(newState))
      throw new Error(`Not available state ${newState}`);

    setState(newState);
  };

  const nextStateCallback = () => {
    const nextState = stateMachine[state].nextState;

    if (!nextState || !stateMachine[state].availableStates.includes(nextState))
      throw new Error(`No next state or not available, nextState: ${nextState}`);

    setState(nextState);
  };

  const resetGame = () => {
    setStateCallback("reset");
  };

  useStateReducer({
    lose: () => {
      //todo: Тут будет ошибка non-serializable, далее не прокидывать функции, а придумать что-то изящнее
      const closeCallback = () => {
        resetGame();
      };
      addModal({type: "gameEnd", props: {status: "lose", actions: {close: closeCallback}}});
    },
    win: () => {
      //todo: Тут будет ошибка non-serializable, далее не прокидывать функции, а придумать что-то изящнее
      const closeCallback = () => {
        resetGame();
      };
      addModal({type: "gameEnd", props: {status: "win", actions: {close: closeCallback}}});
    }
  }, ignoreNextState, nextStateCallback, state, wrapper);

  useLoadController({
    getLibsPromise: basePixiImports,
    getWrapperPromise: () => import("../../controllers/tetris/TetrisWrapper"),
    beforeInit: ({wrapper}) => setWrapper(wrapper),
    afterInit: ({wrapper}) => {
      wrapper.setLevel("1");
      wrapper.appendContainer(containerRef.current);
    }
  });

  useEffect(() => {
    if (!wrapper) return;

    const callbacks = {
      "state:next": nextStateCallback,
      "state:change": setStateCallback,
      "game:lost": () => setStateCallback("lose"),
      "game:won": () => setStateCallback("win")
    };

    const listenerLogic = method => {
      for (const key in callbacks)
        wrapper.eventBus[`${method}EventListener`](key, callbacks[key]);
    };

    listenerLogic("add");
    return () => listenerLogic("remove");
  }, [wrapper, state]);

  const isLoading = useMemo(() => stateMachine[state].isLoading, [state]);

  return (
    <div className={"tetris"}>
      <Loader isVisible={isLoading}/>
      <div className={"tetris__container"} ref={containerRef}/>
      <Stats eventBus={wrapper?.eventBus}/>
    </div>
  );
};

export default Scene;

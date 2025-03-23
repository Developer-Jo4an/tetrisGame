import {useMemo, useRef, useState} from "react";
import {useLoadController} from "../../utils/scene/react/hooks/useLoadController";
import useStateReducer from "../../utils/scene/react/hooks/useStateReducer";
import {Stats} from "../stats/Stats";
import {useTetrisReducers} from "../../hooks/tetris/useTetrisReducers";
import {useReactionsOnEventBusActions} from "../../hooks/tetris/useReactionsOnEventBusActions";
import {Boosters} from "../boosters/Boosters";
import {Menu} from "../menu/Menu";
import Loader from "../loader/Loader";
import {ignoreNextState, stateMachine, tetrisTimelineSpaceId} from "../../constants/tetris";
import {tetrisPixiImports} from "../../controllers/tetris/imports/tetrisPixiImport";

const TetrisComponents = () => {
  const [wrapper, setWrapper] = useState();
  const [state, setState] = useState(Object.entries(stateMachine).find(([_, value]) => value.isDefault)[0]);
  const containerRef = useRef();

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

  const reducers = useTetrisReducers({setStateCallback});

  useStateReducer(reducers, ignoreNextState, nextStateCallback, state, wrapper);

  useLoadController({
    getWrapperPromise: () => import("../../controllers/tetris/TetrisWrapper"),
    getLibsPromise: () => tetrisPixiImports(tetrisTimelineSpaceId),
    beforeInit: ({wrapper}) => setWrapper(wrapper),
    afterInit: ({wrapper}) => {
      wrapper.setLevel("1");
      wrapper.appendContainer(containerRef.current);
    }
  });

  useReactionsOnEventBusActions({wrapper, state, nextStateCallback, setStateCallback});

  const isLoading = useMemo(() => stateMachine[state].isLoading, [state]);

  return (
    <div className={"tetris"}>
      <Loader isVisible={isLoading}/>
      <div className={"tetris__wrapper"}>
        <div className={"tetris__container"} ref={containerRef}/>
        <Menu state={state} setState={setState}/>
        <Boosters eventBus={wrapper?.eventBus} state={state}/>
        <Stats eventBus={wrapper?.eventBus} state={state}/>
      </div>
    </div>
  );
};

export default TetrisComponents;

import {stateMachine} from "../../constants/tetris";

export const useTetrisStateControls = ({state, setState}) => {
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

  return {setStateCallback, nextStateCallback}
};

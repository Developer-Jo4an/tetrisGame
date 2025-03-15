import {useEffect} from "react";

export const useReactionsOnEventBusActions = props => {
  const {wrapper, state, nextStateCallback, setStateCallback} = props;

  useEffect(() => {
    if (!wrapper) return;

    const {eventBus} = wrapper;

    const callbacks = {
      "state:next": nextStateCallback,
      "state:change": setStateCallback,
      "game:lost": () => setStateCallback("lose"),
      "game:won": () => setStateCallback("win")
    };

    const listenerLogic = method => {
      for (const key in callbacks)
        eventBus[`${method}EventListener`](key, callbacks[key]);
    };

    listenerLogic("add");
    return () => listenerLogic("remove");
  }, [wrapper, state]);

};

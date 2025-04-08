import {useEffect, useMemo, useState} from "react";
import {CSSTransition} from "react-transition-group";

export const Stats = ({eventBus, state}) => {
  const [stats, setStats] = useState([]);

  const formattedStates = Object.entries(stats ?? {});

  useEffect(() => {
    if (!eventBus) return;

    const callbacks = {
      "timeout:update": ({remainder}) => {
        setStats(prev => ({...prev, remainingTime: remainder}));
      },
      "targetPoints:update": ({targetPoints}) => {
        setStats(prev => ({...prev, targetPoints}));
      },
      "currentPoints:update": ({updatedCount}) => {
        setStats(prev => ({...prev, currentCount: updatedCount}));
      }
    };

    const listenerLogic = method => {
      for (const key in callbacks)
        eventBus[`${method}EventListener`](key, callbacks[key]);
    };

    listenerLogic("add");
    return () => listenerLogic("remove");
  }, [eventBus]);

  return (
    <CSSTransition
      in={!!formattedStates.length} timeout={300} appear={true} mountOnEnter={true} unmountOnExit={true}
      classNames={"stats"}
    >
      <div className={"stats"}>
        <div className={"stats__list"}>
          {formattedStates.map(([key, value]) => <div key={key} className={"stats__item"}>{key}:{value}</div>)}
        </div>
      </div>
    </CSSTransition>
  );
};

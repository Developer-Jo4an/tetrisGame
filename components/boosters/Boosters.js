import {useEffect, useState} from "react";
import {CSSTransition, SwitchTransition} from "react-transition-group";
import {CustomButton} from "../customButton/CustomButton";

export const Boosters = ({eventBus}) => {
  const [boosters, setBoosters] = useState({bomb: 1, deleteBricks: 2});
  const [isShowedBoosters, setIsShowedBoosters] = useState(false);

  const enableBooster = boosterName => {

  };

  const setIsShowedBoostersCallback = isShowed => {
    setIsShowedBoosters(isShowed);
  };

  useEffect(() => {
    if (!eventBus) return;

    const callbacks = {
      "boosters:set": () => {

      },
      "booster:enabled": () => {

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
    <div className={"boosters"}>
      <SwitchTransition mode={"out-in"}>
        <CSSTransition
          key={isShowedBoosters}
          classNames={"boosters__item"}
          mountOnEnter={true}
          unmountOnExit={true}
          appear={true}
          timeout={500}
        >
          {isShowedBoosters
            ?
            <div className={"boosters__item boosters__list"}>
              <CustomButton
                className={"boosters__btn boosters__btn_hide"}
                onClick={() => setIsShowedBoostersCallback(false)}
                timeout={1000}
              >
                <img
                  src={`images/boosters/boosters-hide.png`}
                  className={"boosters__btn-image boosters__btn-image_hide"}
                  alt={"boosters-image"}
                />
              </CustomButton>
              {Object.entries(boosters ?? {}).map(([boosterName, amount]) =>
                <CustomButton
                  key={boosterName}
                  className={"boosters__booster"}
                  disabled={Boolean(amount)}
                  onClick={() => enableBooster(boosterName)}
                  timeout={1000}
                >
                  <img src={`images/boosters/${boosterName}.png`} className={"boosters__image"} alt={"booster-image"}/>
                  <div className={"boosters__counter"}>{amount}</div>
                </CustomButton>
              )}
            </div>
            :
            <CustomButton
              className={"boosters__item boosters__btn boosters__btn_show"}
              onClick={() => setIsShowedBoostersCallback(true)}
              timeout={1000}
            >
              <img
                src={`images/boosters/boosters-show.png`}
                className={"boosters__btn-image boosters__btn-image_show"}
                alt={"boosters-image"}
              />
            </CustomButton>
          }
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
};

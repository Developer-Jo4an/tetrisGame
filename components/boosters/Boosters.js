import {useEffect, useMemo, useState} from "react";
import {CSSTransition, SwitchTransition} from "react-transition-group";
import {CustomButton} from "../customButton/CustomButton";

const copyright = {
  activeBooster: {
    bomb: {
      text: "Нажмите на клетку, чтобы сбросить туда бомбу"
    },
    deleteBricks: {
      text: "Нажмите на клетку, чтобы сбросить удалялку кирпичиков"
    }
  }
};

export const Boosters = ({eventBus, state}) => {
  const [boosters, setBoosters] = useState();
  const [isShowedBoosters, setIsShowedBoosters] = useState(false);

  const formattedBoosters = useMemo(() => Object.entries(boosters ?? {}), [boosters]);

  const activeBooster = useMemo(() => formattedBoosters.find(([, data]) => data.isActive)?.[0], [formattedBoosters]);

  const enableBooster = boosterName => {
    const boosterData = {booster: boosterName, isActive: null};

    setBoosters(prev => Object.entries(prev).reduce((acc, [name, data]) => ({
      ...acc,
      [name]: {...data, isActive: boosterName === name && (boosterData.isActive = !data.isActive)}
    }), {}));

    const {booster, isActive} = boosterData;

    eventBus.dispatchEvent({type: "booster:change", booster: isActive ? booster : "reset"});
  };

  const setIsShowedBoostersCallback = isShowed => {
    setIsShowedBoosters(isShowed);
  };

  useEffect(() => {
    if (!eventBus) return;

    const callbacks = {
      "boosters:installed": ({boosters}) => {
        setBoosters(boosters);
      }
    };

    const listenerLogic = method => {
      for (const key in callbacks)
        eventBus[`${method}EventListener`](key, callbacks[key]);
    };

    listenerLogic("add");
    return () => listenerLogic("remove");
  }, [eventBus]);

  useEffect(() => {
    ({
      reset: () => {
        setBoosters(null);
        setIsShowedBoosters(false);
      }
    })[state]?.();
  }, [state]);

  return (<>
      <div className={"boosters"}>
        <SwitchTransition mode={"out-in"}>
          <CSSTransition
            key={isShowedBoosters}
            classNames={"boosters__item"}
            appear={true}
            timeout={300}
          >
            <div className={"boosters__item"}>
              {isShowedBoosters
                ?
                <div
                  className={"boosters__content"}
                  onClick={() => setIsShowedBoostersCallback(false)}
                >
                  <CustomButton
                    className={"boosters__btn boosters__btn_hide"}
                    onClick={() => setIsShowedBoostersCallback(false)}
                    timeout={1000}
                  >
                    <img
                      src={`/images/tetris/boosters/boosters-hide.png`}
                      className={"boosters__btn-image boosters__btn-image_hide"}
                      alt={"boosters-image"}
                    />
                  </CustomButton>
                  <div
                    className={"boosters__content-list"}
                    style={{
                      "--rows": Math.ceil(formattedBoosters.length / 3),
                      "--columns": Math.min(3, formattedBoosters.length)
                    }}
                  >
                    {formattedBoosters.map(([boosterName, {isActive, amount}]) =>
                      <div className={"boosters__content-list-item"} key={boosterName}>
                        <CustomButton
                          className={"boosters__booster"}
                          disabled={Boolean(!amount)}
                          onClick={() => amount && enableBooster(boosterName)}
                        >
                          <img
                            src={`/images/tetris/boosters/${boosterName}.png`}
                            className={"boosters__image"}
                            alt={"booster-image"}
                          />
                          <div className={"boosters__booster-counter"}>{amount}</div>
                          {isActive &&
                            <div className={"boosters__booster-check"}>
                              <img src={"/images/tetris/boosters/check.png"} alt={"booster-check"}/>
                            </div>
                          }
                        </CustomButton>
                      </div>
                    )}
                  </div>
                </div>
                :
                <CustomButton
                  className={"boosters__btn boosters__btn_show"}
                  onClick={() => setIsShowedBoostersCallback(true)}
                  timeout={1000}
                >
                  <img
                    src={"/images/tetris/boosters/boosters-show.png"}
                    className={"boosters__btn-image boosters__btn-image_show"}
                    alt={"boosters-image"}
                  />
                </CustomButton>
              }
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
      {activeBooster &&
        <div className={"boosters__active-booster"}>
          <div className={"boosters__active-booster-view"}>
            <img src={`/images/tetris/boosters/${activeBooster}.png`} alt={"active-booster"}/>
          </div>
          <div className={"boosters__active-booster-description"}>{copyright.activeBooster[activeBooster].text}</div>
        </div>
      }
    </>
  );
};

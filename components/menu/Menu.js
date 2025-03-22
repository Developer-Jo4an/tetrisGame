import menuCopyright from "./copyright";
import {CustomButton} from "../customButton/CustomButton";
import Icon from "../baseComponents/gui/icon/Icon";

const {buttons} = menuCopyright;

export const Menu = ({state, setState}) => {
  const buttonsCallbacks = {
    pause() {
      const nextState = ({pause: "playing"})[state] ?? "pause";
      setState(nextState);
    }
  };

  return (
    <div className={"menu"}>
      {buttons.map(({attr, icon, action}) =>
        <CustomButton {...attr} onClick={buttonsCallbacks[action]}>
          {!!icon && <Icon name={icon[state] ?? "tetris/pause"}/>}
        </CustomButton>
      )}
    </div>
  );
};

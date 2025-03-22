import {useModal} from "../../../hooks/useModal";
import {CustomButton} from "../../customButton/CustomButton";
import gameEndCopyright from "./copyright";

const {buttons, dataByStatus} = gameEndCopyright;

export const GameEndModal = ({id, status, actions}) => {
  const {closeModal} = useModal();

  const callbacks = {
    close() {
      actions.close();
      closeModal({id});
    }
  };

  const {title} = dataByStatus[status];

  return (
    <div className={"game-end-modal"}>
      <div className={"game-end-modal__content"}>
        <div className={"game-end-modal__title"}>{title}</div>
        <div className={"game-end-modal__buttons"}>
          {buttons.map(({attr, text, action}) =>
            <CustomButton
              {...attr}
              key={`game-modal-button:${action}`}
              className={"game-end-modal__button"}
              onClick={callbacks[action]}
            >{text}</CustomButton>)}
        </div>
      </div>
    </div>
  );
};

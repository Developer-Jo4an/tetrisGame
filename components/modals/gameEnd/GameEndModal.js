import {useModal} from "../../../hooks/useModal";
import {CustomButton} from "../../customButton/CustomButton";

const copyright = {
  buttons: [
    {
      attr: {text: "Закрыть"},
      action: "close"
    }
  ],
  dataByStatus: {
    win: {
      title: "Вы выиграли!"
    },
    lose: {
      title: "Вы проиграли!"
    }
  }
};

const {buttons, dataByStatus} = copyright;

export const GameEndModal = ({id, status, actions}) => {
  const {closeModal} = useModal();

  const callbacks = {
    close: () => {
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
          {buttons.map(({attr: {text}, action}) => {
            return <CustomButton
              key={`game-modal-button:${action}`}
              className={"game-end-modal__button"}
              onClick={callbacks[action]}
            >{text}</CustomButton>;
          })}
        </div>
      </div>
    </div>
  );
};

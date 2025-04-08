import {useModal} from "../useModal";

export const useTetrisReducers = ({setStateCallback}) => {
  const {addModal, closeModal} = useModal();

  return {
    lose: () => {
      const closeCallback = () => {
        setStateCallback("reset");
      };
      addModal({type: "gameEnd", props: {status: "lose", actions: {close: closeCallback}}});
    },
    win: () => {
      const closeCallback = () => {
        setStateCallback("reset");
      };
      addModal({type: "gameEnd", props: {status: "win", actions: {close: closeCallback}}});
    }
  };
};

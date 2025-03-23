import {useModal} from "../useModal";

export const useTetrisReducers = ({setStateCallback}) => {
  const {addModal, closeModal} = useModal();

  return {
    lose: () => {
      //todo: Тут будет ошибка non-serializable, далее не прокидывать функции, а придумать что-то изящнее
      const closeCallback = () => {
        setStateCallback("reset");
      };
      addModal({type: "gameEnd", props: {status: "lose", actions: {close: closeCallback}}});
    },
    win: () => {
      //todo: Тут будет ошибка non-serializable, далее не прокидывать функции, а придумать что-то изящнее
      const closeCallback = () => {
        setStateCallback("reset");
      };
      addModal({type: "gameEnd", props: {status: "win", actions: {close: closeCallback}}});
    }
  };
};

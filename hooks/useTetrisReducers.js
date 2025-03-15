import {useModal} from "./useModal";

export const useTetrisReducers = props => {
  const {resetGame} = props;

  const {addModal, closeModal} = useModal();

  return {
    lose: () => {
      //todo: Тут будет ошибка non-serializable, далее не прокидывать функции, а придумать что-то изящнее
      const closeCallback = () => {
        resetGame();
      };
      addModal({type: "gameEnd", props: {status: "lose", actions: {close: closeCallback}}});
    },
    win: () => {
      //todo: Тут будет ошибка non-serializable, далее не прокидывать функции, а придумать что-то изящнее
      const closeCallback = () => {
        resetGame();
      };
      addModal({type: "gameEnd", props: {status: "win", actions: {close: closeCallback}}});
    }
  };
};

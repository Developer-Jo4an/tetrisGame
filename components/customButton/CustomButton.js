import Button from "../baseComponents/gui/button/Button";
import {useEffect, useRef, useState} from "react";
import classNames from "classnames";

export const CustomButton = ({disabled, className, timeout, disposable, onClick, ...props} = {}) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const timerRef = useRef();

  if (disposable && typeof timeout === "number")
    throw new Error("incompatible properties: disposable and timeout");

  const onClickCallback = e => {
    if (isDisabled) return;

    if (disposable)
      setIsDisabled(true);

    if (typeof timeout === "number") {
      setIsDisabled(true);

      timerRef.current = setTimeout(() => {
        setIsDisabled(false);
        timerRef.current = null;
      }, timeout);
    }

    onClick?.(e);
  };

  useEffect(() => () => typeof timerRef.current === "number" && clearTimeout(timerRef.current), []);

  return (
    <Button
      className={classNames("custom-button", className)}
      disabled={disabled}
      onClick={onClickCallback}
      {...props}
    />
  );
};

import { useEffect, useState } from "react";

export const useElapsed = (startedAt: number) => {
  const [seconds, setSeconds] = useState(() => Math.floor((Date.now() - startedAt) / 1000));

  useEffect(() => {
    const tick = () => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    };

    tick();

    const timer = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [startedAt]);

  return seconds;
};

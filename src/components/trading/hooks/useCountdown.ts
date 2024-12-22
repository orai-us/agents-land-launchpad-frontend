import { ALL_CONFIGS } from "@/config";
import { useEffect, useRef, useState } from "react";

export type CountDownType = {
  startTime: number;
  endTime: number;
  onStart: () => void;
  onEnd: () => void;
};

export const calcDiffTime = (
  start: string | Date | number,
  end: string | Date | number
) => {
  return new Date(end).getTime() - new Date(start).getTime();
};

export const calcPercent = (start: number, end: number, current: number) => {
  const total =
    new Date(end * ALL_CONFIGS.TIMER.MILLISECOND).getTime() -
    new Date(start * ALL_CONFIGS.TIMER.MILLISECOND).getTime();

  if (current <= 0) return 100;
  return total > 0 ? 100 - (current * 100) / total : 100;
};

export const formatCountdownTime = (milliseconds: number) => {
  const formatMilliseconds = milliseconds < 0 ? 0 : milliseconds;
  const seconds = Math.floor(
    formatMilliseconds / ALL_CONFIGS.TIMER.MILLISECOND
  );
  const minutes = Math.floor(seconds / ALL_CONFIGS.TIMER.SECOND);
  const hours = Math.floor(minutes / ALL_CONFIGS.TIMER.MINUTE);
  const days = Math.floor(hours / ALL_CONFIGS.TIMER.HOUR);

  const remainingHours = hours % ALL_CONFIGS.TIMER.HOUR;
  const remainingMinutes = minutes % ALL_CONFIGS.TIMER.MINUTE;
  const remainingSeconds = seconds % ALL_CONFIGS.TIMER.SECOND;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(remainingHours).padStart(2, "0"),
    minutes: String(remainingMinutes).padStart(2, "0"),
    seconds: String(remainingSeconds).padStart(2, "0"),
  };
};

export const useCountdown = ({
  startTime,
  endTime,
  onStart,
  onEnd,
}: CountDownType) => {
  // // Mock DATA
  // bidInfo['start_time'] = new Date('2024-01-12T11:29:10.691Z').getTime();
  // bidInfo['end_time'] = new Date('2024-01-12T11:30:10.691Z').getTime();

  const [percent, setPercent] = useState(0);
  const [isEnd, setIsEnd] = useState(false);
  const countdownRef = useRef<any>(null);
  const getTimeDateNow = Date.now();
  const [start, setStart] = useState(startTime * ALL_CONFIGS.TIMER.MILLISECOND);
  const [end, setEnd] = useState(endTime * ALL_CONFIGS.TIMER.MILLISECOND);
  const [timeRemaining, setTimeRemaining] = useState(() => {
    return calcDiffTime(
      getTimeDateNow,
      endTime * ALL_CONFIGS.TIMER.MILLISECOND
    );
  });
  const [isStarted, setIsStarted] = useState(() => {
    const isStart = getTimeDateNow >= startTime * ALL_CONFIGS.TIMER.MILLISECOND;
    return isStart;
  });

  useEffect(() => {
    if (!startTime || !endTime) return;

    setStart(startTime * ALL_CONFIGS.TIMER.MILLISECOND);
    setEnd(endTime * ALL_CONFIGS.TIMER.MILLISECOND);
    setIsStarted(() => {
      const isStart =
        getTimeDateNow >= startTime * ALL_CONFIGS.TIMER.MILLISECOND;

      if (isStart) {
        onStart();
      }

      return isStart;
    });

    setTimeRemaining(() =>
      calcDiffTime(getTimeDateNow, endTime * ALL_CONFIGS.TIMER.MILLISECOND)
    );

    const decrementTime = () => {
      setTimeRemaining((prev) => {
        const newRemain = prev - ALL_CONFIGS.TIMER.MILLISECOND;
        if (newRemain <= 0) {
          clearInterval(countdownRef.current as any);
          countdownRef.current = null;
          setIsEnd(true);
          onEnd();
          return 0;
        }
        return newRemain;
      });
    };
    countdownRef.current = setInterval(
      decrementTime,
      ALL_CONFIGS.TIMER.MILLISECOND
    );

    return () => {
      if (countdownRef.current) {
        console.log("Clean =>> countdown");
        clearInterval(countdownRef.current);
      }
    };
  }, [startTime, endTime]);

  useEffect(() => {
    if (!startTime || !endTime) return;
    const newPercent = calcPercent(startTime, endTime, timeRemaining);
    setPercent(() => newPercent);

    if (
      getTimeDateNow >= startTime * ALL_CONFIGS.TIMER.MILLISECOND &&
      !isStarted
    ) {
      setIsStarted(true);
      onStart();
    }
  }, [timeRemaining, startTime, endTime]);

  return {
    isStarted,
    timeRemaining,
    isEnd,
    percent,
    start: new Date(start * ALL_CONFIGS.TIMER.MILLISECOND),
    end: new Date(end * ALL_CONFIGS.TIMER.MILLISECOND),
  };
};

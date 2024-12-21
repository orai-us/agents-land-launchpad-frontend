import { ALL_CONFIGS } from "@/config";
import { formatCountdownTime, useCountdown } from "./hooks/useCountdown";

const Countdown = ({ onEnd, coin }) => {
  const startTime = Math.ceil(
    new Date(coin.date || Date.now()).getTime() / ALL_CONFIGS.TIMER.MILLISECOND
  );
  const endTime = startTime + ALL_CONFIGS.TIMER.DAY_TO_SECONDS;

  const { timeRemaining } = useCountdown({
    startTime,
    endTime,
    onStart: () => {},
    onEnd: () => {
      console.log("Start for Sale");
      onEnd();
    },
  });

  const { days, hours, minutes, seconds } = formatCountdownTime(timeRemaining);

  return (
    <div className="bg-[rgba(99,_146,_232,_0.08)] p-4 rounded-lg">
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6ZM6 3C6.27614 3 6.5 3.22386 6.5 3.5V5.79289L7.35355 6.64645C7.54882 6.84171 7.54882 7.15829 7.35355 7.35355C7.15829 7.54882 6.84171 7.54882 6.64645 7.35355L5.64645 6.35355C5.55268 6.25979 5.5 6.13261 5.5 6V3.5C5.5 3.22386 5.72386 3 6 3Z"
            fill="#9192A0"
          />
        </svg>
        <span className="text-[#9192A0] text-[12px] ml-1">Phase start at</span>
      </div>

      <div className="flex mt-3">
        <div className="text-[20px] text-[#6392E9] font-semibold">{hours}h</div>
        <div className="text-[20px] text-[#6392E9] font-semibold">
          {minutes}m
        </div>
        <div className="text-[20px] text-[#6392E9] font-semibold">
          {seconds}s
        </div>
      </div>
    </div>
  );
};

export default Countdown;

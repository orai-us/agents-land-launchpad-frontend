import { msgInfo, userInfo } from "@/utils/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Custom locale configuration
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "1m", // 1 minute
    mm: "%dm", // 2-59 minutes
    h: "1h", // 1 hour
    hh: "%dh", // 2-23 hours
    d: "1d", // 1 day
    dd: "%dd", // 2-30 days
    M: "1mo", // 1 month
    MM: "%dmo", // 2-12 months
    y: "1y", // 1 year
    yy: "%dy", // 2+ years
  },
});

interface MessageFormProps {
  msg: msgInfo;
}

export const MessageForm: React.FC<MessageFormProps> = ({ msg }) => {
  return (
    <div className="mt-6 flex flex-col">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <div className="text-[14px] text-[#E8E9EE] underline">
            {msg.sender && (msg.sender as userInfo).name}
          </div>
          {msg.time && (
            <div className="text-[12px] text-[#84869A] mt-2">
              {dayjs(msg.time || Date.now()).fromNow()}
            </div>
          )}
        </div>
        <div className="flex flex-row w-full border border-[#1A1C28] border-x-0 border-t-0">
          {/* {msg.img !== undefined && (
            <img
              src={msg.img}
              className="mr-5"
              alt="Token IMG"
              width={200}
              height={300}
            />
          )} */}
          <div className="w-full h-full flex flex-col text-[#E8E9EE] font-semibold py-3 text-sm">
            {msg.msg}
          </div>
        </div>
      </div>
    </div>
  );
};

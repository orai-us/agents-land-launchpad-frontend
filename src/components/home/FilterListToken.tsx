"use client";
import Link from "next/link";
import { FC, useState } from "react";
import { twMerge } from "tailwind-merge";
import { STATUS_TOKEN, TokenTab } from "./ListToken";
import { BiSearchAlt } from "react-icons/bi";

const FilterListToken: FC<{ type; setType }> = ({ type, setType }) => {
  // const {
  //   filterState,
  //   setFilterState,
  //   nsfwFilterState,
  //   setNsfwFilterState,
  // } = useContext(UserContext);

  const [filterState, setFilterState] = useState<{
    label: string;
    value: string;
  }>({
    label: "Featured",
    value: "featured",
  });

  const [token, setToken] = useState("");

  const searchToken = () => {};

  return (
    <div className="flex flex-wrap mt-14 justify-between items-center">
      <div className="flex ">
        {Object.values(TokenTab).map((e, key) => (
          <Link
            href={e.link}
            key={e.label}
            onClick={() => setType(e.value)}
            className={twMerge(
              "uppercase mr-4 px-4 py-[6px] rounded border border-[rgba(88,_90,_107,_0.32)] text-[#585A6B]",

              type === e.value && "bg-[#585A6B] text-[#E8E9EE]"
            )}
          >
            {e.label}
          </Link>
        ))}
      </div>
      <div className="flex ">
        {type === STATUS_TOKEN.LUNCH && (
          <div className="relative cursor-pointer group mr-4">
            <button
              id="dropdownHoverButton"
              data-dropdown-toggle="dropdownHover"
              data-dropdown-trigger="hover"
              className="w-screen max-w-[150px] h-10 text-[#F3F4F6] bg-[#13141D] shadow shadow-[rgba(255,255,255,0.08)] hover:brightness-110 font-medium rounded-lg text-sm px-2 py-[6px] flex items-center justify-between"
              type="button"
            >
              <span className="text-nowrap">{filterState.label}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.19526 5.49995C3.45561 5.2396 3.87772 5.2396 4.13807 5.49995L8 9.36188L11.8619 5.49995C12.1223 5.2396 12.5444 5.2396 12.8047 5.49995C13.0651 5.7603 13.0651 6.18241 12.8047 6.44276L8.94281 10.3047C8.42211 10.8254 7.57789 10.8254 7.05719 10.3047L3.19526 6.44276C2.93491 6.18241 2.93491 5.7603 3.19526 5.49995Z"
                  fill="#9192A0"
                />
              </svg>
            </button>

            <div
              id="dropdownHover"
              className={twMerge(
                "z-10 absolute right-0 top-full pt-2 invisible group-hover:visible w-[150px]"
              )}
            >
              <ul
                className="py-2 text-sm text bg-[#1A1C28] border border-[rgba(88,90,107,0.24)] rounded-lg"
                aria-labelledby="dropdownHoverButton"
              >
                {[
                  {
                    label: "Featured",
                    value: "featured",
                  },
                  {
                    label: "Last trade",
                    value: "last_trade",
                  },
                  {
                    label: "Market cap",
                    value: "market_cap",
                  },
                  {
                    label: "Creation time",
                    value: "creation_time",
                  },
                ].map((e, idx) => {
                  return (
                    <li
                      key={`sorted_key_${idx}_${e.value}`}
                      onClick={() => {
                        setFilterState(e);
                      }}
                    >
                      <span
                        className={twMerge(
                          "p-2 flex justify-start bg-[#1A1C28] gap-2 items-center mb-1 text-primary-100 text-md tracking-[-0.32px] hover:bg-[#13141D] text-[#F3F4F6]",
                          e.value === filterState.value &&
                            "cursor-not-allowed pointer-events-none bg-[#13141D]"
                        )}
                      >
                        {e.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <div className="w-screen max-w-[298px] flex flex-row items-center gap-1 pl-5 text-[#F3F4F6] bg-[#13141D] shadow shadow-[rgba(255,255,255,0.08)] hover:brightness-110 font-medium rounded-lg">
          <BiSearchAlt
            className="text-4xl text-[#585A6B]"
            width={16}
            height={16}
          />
          <input
            type="text"
            value={token}
            placeholder="Search Tokens"
            onChange={(e) => setToken(e.target.value)}
            className=" bg-[#13141D] w-full py-1 outline-none bg-transparent text-[14px] placeholder:text-[#585A6B]"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterListToken;

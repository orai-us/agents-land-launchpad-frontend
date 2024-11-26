"use client"
import { coinInfo } from "@/utils/types";
import { FC, useContext, useState } from "react";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";

const SocialList: FC = () => {

	return (
		<div className="flex flex-row gap-4 py-4 px-2">
			<p className="text-2xl text-[#143F72] bg-[#143F72]/30 hover:text-white hover:border-white hover:bg-white/30 p-2 cursor-pointer rounded-full border-[1px] border-[#143F72]">
				<FaXTwitter />
			</p>
			<p className="text-2xl text-[#143F72] bg-[#143F72]/30 hover:text-white hover:border-white hover:bg-white/30 p-2 cursor-pointer rounded-full border-[1px] border-[#143F72]">
				<FaTelegramPlane />
			</p>
		</div>
	);
};

export default SocialList;

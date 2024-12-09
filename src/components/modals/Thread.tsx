import UserContext from '@/context/UserContext';
import { coinInfo, replyInfo, tradeInfo, userInfo } from '@/utils/types';
import { postReply } from '@/utils/util';
import React, { ChangeEvent, useContext, useMemo, useRef, useState } from 'react';
import { errorAlert, successAlert } from '../others/ToastGroup';
import ImgIcon from '@/../public/assets/images/imce-logo.jpg';

import { uploadImage } from '@/utils/fileUpload';

interface ThreadProps {
  data: coinInfo;
}

const ThreadSection: React.FC<ThreadProps> = ({ data }) => {
  const { postReplyModal, setPostReplyModal, user } = useContext(UserContext);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const replyPost = async () => {
    let reply: replyInfo;
    if (imageUrl) {
      const url = await uploadImage(imageUrl);
      if (url && user._id) {
        console.log('user._id: ', user._id);
        console.log('url: ', url);

        reply = {
          coinId: data._id,
          sender: user._id,
          msg: msg,
          img: url
        };
      }
    } else {
      if (user._id) {
        reply = {
          coinId: data._id,
          sender: user._id,
          msg: msg
        };
      }
    }
    console.log('first', user, reply);
    // handleModalToggle();
    const res = await postReply(reply);
    if (res) {
      setMsg('');
    }
  };

  const handleModalToggle = () => {
    setPostReplyModal(!postReplyModal);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        successAlert('Please select a valid image file.');
        return;
      }
      const url = URL.createObjectURL(file);
      setFileName(file.name || ''); // Ensure it's always a string
      setImageUrl(url); // URL.createObjectURL always returns a string
    }
  };

  return (
    <div className="flex w-full mt-4 flex-col py-2 pb-10 gap-3 relative rounded border-[#30344A] border">
      <div className=" w-full px-3 flex flex-col">
        <textarea
          rows={4}
          id="msg"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="outline-none focus:brightness-110 w-full p-3 placeholder:text-[#84869A] text-[#E8E9EE]  bg-transparent"
          placeholder="Write your comments"
          required
        />
      </div>

      {/* <div className="w-full flex flex-col md:flex-row justify-between gap-3 md:pr-6">
        <div>
          <label
            htmlFor="fileUpload"
            className="block text-lg font-medium mb-2 text-white"
          >
            Upload Image:
          </label>
          <label
            htmlFor="fileUpload"
            className="w-full p-2 rounded-lg outline-none bg-transparent border-[1px] border-white text-center text-white cursor-pointer hover:bg-white hover:text-black transition mx-auto flex"
          >
            {fileName || "Choose an Image"}
          </label>
          <input
            id="fileUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>

        {imageUrl ? (
          <div className="w-48 h-48 border rounded-lg overflow-hidden justify-center mx-auto">
            <img
              src={imageUrl as string} // Ensure it's a string
              alt="Selected Preview"
              className="flex object-cover w-full h-full mx-auto"
            />
          </div>
        ) : (
          <div className="w-48 h-48 border rounded-lg overflow-hidden p-3">
            <img
              src={ImgIcon}
              alt="Default Avatar"
              className="flex object-cover w-full h-full rounded-full mx-auto"
            />
          </div>
        )}
      </div> */}
      <div className="flex justify-around p-3 absolute right-0 bottom-0">
        <button disabled={!msg} onClick={replyPost} className="disabled:brightness-[60%] disabled:pointer-events-none mt-2 px-4 py-2 bg-[#1A1C28] text-[#E8E9EE] text-[14px] rounded uppercase hover:brightness-125 cursor-pointer">
          POST
        </button>
      </div>
    </div>
  );
};

export default ThreadSection;

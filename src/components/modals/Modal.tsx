import UserImg from "@/assets/images/userAgentDefault.svg";
import UserContext from "@/context/UserContext";
import { userInfo } from "@/utils/types";
import { reduceString, updateUser } from "@/utils/util";
import React, { ChangeEvent, useContext, useRef, useState } from "react";
import { errorAlert, successAlert } from "../others/ToastGroup";
import { uploadImage } from "@/utils/fileUpload";
import { useSocket } from "@/contexts/SocketContext";
import { Spinner } from "../loadings/Spinner";

interface ModalProps {
  data: userInfo;
}

const Modal: React.FC<ModalProps> = ({ data }) => {
  const { isLoading, setIsLoading } = useSocket();
  const { setProfileEditModal, setImageUrl, setUser, user } =
    useContext(UserContext);
  const [index, setIndex] = useState<userInfo>(data);
  const [imagePreview, setImagePreview] = useState<string | null>(
    data.avatar || null
  );
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setIndex({ ...index, [e.target.id]: e.target.value });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }
      const url = URL.createObjectURL(file);
      setFileName(file.name || ""); // Ensure it's always a string
      setImagePreview(url); // URL.createObjectURL always returns a string
    }
  };

  const sendUpdate = async () => {
    try {
      setIsLoading(true);
      let uploadedUrl: string = index.avatar || ""; // Ensure it starts as a string

      if (imagePreview && imagePreview !== index.avatar) {
        const uploadedImageUrl = await uploadImage(imagePreview);

        if (!uploadedImageUrl) {
          setIsLoading(false);
          errorAlert("Image upload failed.");
          return;
        }
        uploadedUrl = uploadedImageUrl || ""; // If uploadImage returns false, fallback to an empty string
      }

      console.log("data: ", data);
      const { name, wallet, isLedger, signature } = index;

      const updatedUser = {
        avatar: uploadedUrl,
        name,
        wallet,
        isLedger,
        signature,
      };

      const result = await updateUser(index._id, updatedUser);

      if (result.error) {
        errorAlert("Failed to save the data.");
      } else {
        successAlert("Successfully updated.");
        setUser({ ...index, ...updatedUser });
        setProfileEditModal(false);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      errorAlert("An error occurred while updating your profile.");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      successAlert("Copied to clipboard!");
    } catch (err) {
      errorAlert("Failed to copy!");
    }
  };

  return (
    <div className="fixed w-full inset-0 flex items-center justify-center z-50 backdrop-blur-md">
      {isLoading && Spinner()}
      <div className="flex w-full md:max-w-[400px] sm:max-w-xl flex-col p-6 rounded-md gap-3 bg-[#13141D] text-[#E8E9EE] relative">
        <button
          onClick={() => setProfileEditModal(false)}
          className="absolute top-6 right-6 text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-[18px] font-medium mb-6">Edit Profile</h2>

        <div className="w-full gap-3">
          <div className="flex justify-between bg-[#080A14] p-4 rounded-lg mb-6">
            <div className="flex items-center">
              {imagePreview ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview as string} // Ensure it's a string
                    alt="Selected Preview"
                    className="flex object-cover w-full h-full mx-auto"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img
                    src={UserImg}
                    alt="Default Avatar"
                    className="flex object-cover w-full h-full mx-auto"
                  />
                </div>
              )}
              <div className="flex items-center ml-2">
                <p className="mr-2 text-[14px] text-[#9192A0]">
                  {reduceString(index?.wallet || "", 4, 4)}
                </p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="cursor-pointer hover:brightness-125"
                  onClick={() => copyToClipboard(index?.wallet)}
                >
                  <path
                    d="M14.1665 14.6676H5.99988C5.86727 14.6676 5.74009 14.615 5.64632 14.5212C5.55256 14.4274 5.49988 14.3003 5.49988 14.1676V6.00098C5.49988 5.86837 5.55256 5.74119 5.64632 5.64742C5.74009 5.55365 5.86727 5.50098 5.99988 5.50098H14.1665C14.2992 5.50098 14.4263 5.55365 14.5201 5.64742C14.6139 5.74119 14.6665 5.86837 14.6665 6.00098V14.1676C14.6665 14.3003 14.6139 14.4274 14.5201 14.5212C14.4263 14.615 14.2992 14.6676 14.1665 14.6676Z"
                    stroke="#585A6B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.4999 5.50065V1.83398C10.4999 1.70138 10.4472 1.5742 10.3535 1.48043C10.2597 1.38666 10.1325 1.33398 9.99992 1.33398H1.83325C1.70064 1.33398 1.57347 1.38666 1.4797 1.48043C1.38593 1.5742 1.33325 1.70138 1.33325 1.83398V10.0006C1.33325 10.1333 1.38593 10.2604 1.4797 10.3542C1.57347 10.448 1.70064 10.5007 1.83325 10.5007H5.49992"
                    stroke="#585A6B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center">
              <label
                htmlFor="fileUpload"
                className="uppercase w-full p-2 rounded outline-none bg-[#1A1C28] text-center text-[12px] text-white cursor-pointer hover:brightness-125 flex items-center"
              >
                Upload
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
          </div>

          <div className="w-full flex flex-col">
            <label
              className="block text-[12px] font-medium uppercase text-[#84869A] mb-3"
              htmlFor="name"
            >
              Username:
            </label>
            <input
              className="w-full px-4 h-12 rounded-lg outline-none bg-transparent border-[1px] border-[#585A6B]"
              type="text"
              id="name"
              value={index.name || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex w-full">
          <button
            disabled={!index.name}
            className="w-full hover:brightness-125 disabled:cursor-not-allowed disabled:brightness-75 disabled:pointer-events-none cursor-pointer bg-[#1A1C28] rounded-lg h-12 flex items-center justify-center mt-6"
            onClick={sendUpdate}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

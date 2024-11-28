"use client";
import {
  ChangeEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/loadings/Spinner";
import { errorAlert } from "@/components/others/ToastGroup";
import { useSocket } from "@/contexts/SocketContext";
import { Web3SolanaProgramInteraction } from "@/program/web3";
import { createCoinInfo, launchDataInfo, metadataInfo } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { IoMdArrowRoundBack } from "react-icons/io";
import ImgIcon from "@/../public/assets/images/imce-logo.jpg";
import { uploadImage, uploadMetadata } from "@/utils/fileUpload";

export default function CreateToken() {
  const [imageUrl, setIamgeUrl] = useState<string>("");
  const { isLoading, setIsLoading } = useSocket();
  const [newCoin, setNewCoin] = useState<createCoinInfo>({} as createCoinInfo);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [getAmt, setGetAmt] = useState<number>(0);
  const [visible, setVisible] = useState<Boolean>(false);

  const [errors, setErrors] = useState({
    name: false,
    ticker: false,
    image: false,
  });

  const wallet = useWallet();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Clear errors when newCoin changes
    setErrors({
      name: !newCoin.name,
      ticker: !newCoin.ticker,
      image: !imageUrl,
    });
  }, [newCoin, imageUrl]);

  const handleToRouter = (path: string) => {
    router.push(path);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewCoin({ ...newCoin, [e.target.id]: e.target.value });
  };

  const handlePresaleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value = e.target.value;

    // Validate input
    const numericValue = parseFloat(value);
    if (numericValue > 1.5 || numericValue < 0) {
      errorAlert("Presale amount must be between 0 and 1.5 SOL");
      return;
    }
    // Set the input value regardless of validation
    setNewCoin((prevState) => ({ ...prevState, [e.target.id]: value }));

    const getAmount =
      1_000_000_000 - (30 * 1_000_000_000) / (30 + (numericValue * 99) / 100);

    setGetAmt(getAmount);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("file--->", file)
    if (file) {
      setSelectedFileName(file.name);
      setImagePreview(URL.createObjectURL(file));
      setIamgeUrl(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const validationErrors = {
      name: !newCoin.name,
      ticker: !newCoin.ticker,
      description: !newCoin.description,
      image: !imageUrl,
      tokenSupply: !newCoin.tokenSupply,
      virtualReserves: !newCoin.virtualReserves,
      preSale: !newCoin.presale
    };
    setErrors(validationErrors);
    return !Object.values(validationErrors).includes(true);
  };

  const createCoin = async () => {
    console.log("imageUrl--->", imageUrl, imagePreview)
    if (!validateForm()) {
      errorAlert("Please fix the errors before submitting.");
      return;
    }

    try {
      setIsLoading(true);
      // Process image upload
      const uploadedImageUrl = await uploadImage(imageUrl);
      if (!uploadedImageUrl) {
        errorAlert("Image upload failed.");
        setIsLoading(false);
        return;
      }
      const jsonData: metadataInfo = {
        name: newCoin.name,
        symbol: newCoin.ticker,
        image: uploadedImageUrl,
        description: newCoin.description,
        createdOn: "https://test.com",
        twitter: newCoin.twitter || undefined,   // Only assign if it exists
        website: newCoin.website || undefined,   // Only assign if it exists
        telegram: newCoin.telegram || undefined   // Only assign if it exists
      }
      // Process metadata upload
      const uploadMetadataUrl = await uploadMetadata(jsonData);
      if (!uploadMetadataUrl) {
        errorAlert("Metadata upload failed.");
        setIsLoading(false);
        return;
      }
      const coinData: launchDataInfo = {
        name: newCoin.name,
        symbol: newCoin.ticker,
        uri: uploadMetadataUrl,
        presale: newCoin.presale,
        decimals: 6,
      }
      console.log("coinData--->", coinData)

      const web3Solana = new Web3SolanaProgramInteraction();
      const res = await web3Solana.createToken(wallet, coinData);
      if (res === "WalletError" || !res) {
        errorAlert("Payment failed or was rejected.");
        setIsLoading(false);
        return;
      }
      router.push("/");
    } catch (error) {
      errorAlert("An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formValid =
    newCoin.name &&
    newCoin.ticker &&
    newCoin.description &&
    newCoin.presale &&
    imageUrl

  return (
    <div className="w-full max-w-[500px] m-auto px-3">
      <div onClick={() => handleToRouter("/")}>
        <div className="cursor-pointer text-white text-2xl flex flex-row items-center gap-2 pb-2">
          <IoMdArrowRoundBack />
          Back
        </div>
      </div>
      {isLoading && Spinner()}
      <div className="w-full flex flex-col gap-4 py-5">
        <h2 className="text-center text-2xl xs:text-4xl font-bold text-white">
          Solana Token Creator
        </h2>
        <div className="w-full text-center text-sm text-white max-w-lg">
          Lorem ipsum dolor sit amet consectetur. Rhoncus nunc blandit mattis mattis arcu posuere cursus.
        </div>

        <div className="flex flex-col gap-4 pt-6">
          <div>
            <label htmlFor="name" className="text-lg font-semibold text-white">
              Token Name (Max 30) <span className="text-red-700">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={newCoin.name || ""}
              onChange={handleChange}
              className={`block w-full p-2.5 ${errors.name ? "border-red-700" : "border-gray-300"} rounded-lg bg-gray-800 text-white outline-none`}
            />
          </div>

          <div>
            <label
              htmlFor="ticker"
              className="text-lg font-semibold text-white"
            >
              Ticker (Max 5) <span className="text-red-700">*</span>
            </label>
            <input
              id="ticker"
              type="text"
              value={newCoin.ticker || ""}
              onChange={handleChange}
              className={`block w-full p-2.5 ${errors.ticker ? "border-red-700" : "border-gray-300"} rounded-lg bg-gray-800 text-white outline-none`}
            />
          </div>
          <div>
            <label htmlFor="description" className="text-lg font-semibold text-white">
              Description <span className="text-red-700">*</span>
            </label>
            <textarea
              id="description"
              rows={2}
              value={newCoin.description || ""}
              onChange={handleChange}
              className={`block w-full p-2.5 ${errors.name ? "border-red-700" : "border-gray-300"} rounded-lg bg-gray-800 text-white outline-none`}
            />
          </div>
          <div>
            <label htmlFor="presale" className="text-lg font-semibold text-white">
              Presale (0 ~ 1.5 SOL) <span className="text-red-700">*</span>
            </label>
            <input
              id="presale"
              type="number"
              value={newCoin.presale || ''}
              onChange={handlePresaleChange}
              className="block w-full p-2.5 rounded-lg bg-gray-800 text-white outline-none"
            />
          </div>
          <div className="w-full flex flex-col justify-between gap-6">
            <div className="w-full justify-between flex flex-col xs:flex-row items-start xs:items-center gap-2">
              <label
                htmlFor="fileUpload"
                className="block text-lg font-semibold text-white"
              >
                Upload Image: <span className="text-red-700">*</span>
              </label>
              <input
                id="fileUpload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                className="py-2 px-4 bg-gray-700 text-white rounded-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFileName || "Choose Image"}
              </button>
            </div>

            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full border rounded-lg overflow-hidden mx-auto"
              />
            ) : (
              <div className="w-full border rounded-lg overflow-hidden">
                <Image
                  src={ImgIcon}
                  alt="Default Avatar"
                  className="flex object-cover w-full h-full mx-auto"
                />
              </div>
            )}
          </div>
        </div>
        <div className="font-xl m-auto mt-5">
          <h1
            className="hover:text-gray-400 cursor-pointer text-white"
            onClick={() => setVisible(!visible)}
          >
            more option
          </h1>
        </div>
        {visible && (
          <>
            <div>
              <label htmlFor="name" className="text-lg font-semibold text-white">
                Website
              </label>
              <input
                type="text"
                id="website"
                value={newCoin.website || ""}
                onChange={handleChange}
                className={`block w-full p-2.5 ${errors.name ? "border-red-700" : "border-gray-300"} rounded-lg bg-gray-800 text-white outline-none`}
              />
            </div>
            <div>
              <label htmlFor="name" className="text-lg font-semibold text-white">
                Twitter
              </label>
              <input
                type="text"
                id="twitter"
                value={newCoin.twitter || ""}
                onChange={handleChange}
                className={`block w-full p-2.5 ${errors.name ? "border-red-700" : "border-gray-300"} rounded-lg bg-gray-800 text-white outline-none`}
              />
            </div>
            <div>
              <label htmlFor="name" className="text-lg font-semibold text-white">
                Telegram
              </label>
              <input
                type="text"
                id="telegram"
                value={newCoin.telegram || ""}
                onChange={handleChange}
                className={`block w-full p-2.5 ${errors.name ? "border-red-700" : "border-gray-300"} rounded-lg bg-gray-800 text-white outline-none`}
              />
            </div>
          </>
        )}
        <button
          onClick={createCoin}
          disabled={!formValid || isLoading}
          className={`mt-4 p-2 rounded-lg bg-blue-700 text-white ${!formValid ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
        >
          {isLoading ? "Creating..." : "Create Coin"}
        </button>
      </div>
    </div>
  );
}

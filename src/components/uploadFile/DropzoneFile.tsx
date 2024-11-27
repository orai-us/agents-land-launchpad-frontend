import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

function DropzoneFile({ onDrop, file, setFile }) {
  // const onDrop = useCallback((acceptedFiles: File[]) => {
  //   console.log("Accepted files:", acceptedFiles);
  // }, []);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      maxFiles: 1,
      onDrop,
      accept: {
        "image/*": [], // Accepts all image types
      },
    });

  return (
    <div
      {...getRootProps()}
      className="h-40 border border-dashed border-[#30344A] px-3 py-4 text-center bg-[#080A14] rounded cursor-pointer"
    >
      <input {...getInputProps()} />

      <div className="h-full flex flex-col justify-center">
        {!file && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="mb-2 mx-auto"
          >
            <path
              d="M24.8813 14.575C24.8813 14.5 24.8937 14.425 24.8937 14.35C24.8937 10.2875 21.6562 7 17.6625 7C14.7812 7 12.3063 8.7125 11.1438 11.1875C10.6375 10.9313 10.0688 10.7812 9.46875 10.7812C7.625 10.7812 6.0875 12.15 5.79375 13.9375C3.58125 14.7 2 16.8188 2 19.3125C2 22.45 4.50625 25 7.59375 25H14V20H10.9875L16 14.7688L21.0125 19.9937H18V24.9937H24.8937C27.7188 24.9937 30 22.65 30 19.7812C30 16.9125 27.7063 14.5812 24.8813 14.575Z"
              fill="#9192A0"
            />
          </svg>
        )}
        {!file && (
          <p className="text-[#84869A] font-medium text-[14px]">
            {isDragActive
              ? "Drop the files here ..."
              : "Drag and drop an image or gif"}
          </p>
        )}
        {file && (
          <div className="relative w-fit p-2">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="w-20 h-20 border rounded-lg overflow-hidden mx-auto"
            />
            <div
              className="absolute top-0 right-0 bg-red-500 rounded-full h-5 w-5 flex items-center justify-center text-white cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                setFile(null);
              }}
            >
              x
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DropzoneFile;

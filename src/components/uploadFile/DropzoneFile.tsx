import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

function DropzoneFile({ onDrop }) {
  // const onDrop = useCallback((acceptedFiles: File[]) => {
  //   console.log("Accepted files:", acceptedFiles);
  // }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [], // Accepts all image types
    },
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #cccccc",
        borderRadius: "10px",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag and drop some files here, or click to select files</p>
      )}
    </div>
  );
}

export default DropzoneFile;

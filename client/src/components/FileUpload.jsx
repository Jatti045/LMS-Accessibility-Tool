import { Upload } from "lucide-react";

const FileUpload = () => {
  const handleFileUpload = (event) => {
    console.log("File uploaded:", event.target.files[0]);
  };

  return (
    <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-teal-900 mb-4">
        Upload New File
      </h2>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-teal-300 border-dashed rounded-lg cursor-pointer bg-teal-50 hover:bg-teal-100 transition duration-300 ease-in-out"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-teal-500 mb-3" />
            <p className="mb-2 text-sm text-teal-700">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-teal-600">
              PDF, DOCX, PPTX (MAX. 100MB)
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>
    </section>
  );
};

export default FileUpload;

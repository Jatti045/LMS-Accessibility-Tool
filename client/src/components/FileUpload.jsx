import React, { useState } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button"; 

const FileUpload = () => {
  const [csvFiles, setCsvFiles] = useState([]);
  const [currentFileName, setCurrentFileName] = useState(""); 
  const userDisplayName = useSelector(
    (state) => state.user.user?.displayName || "User"
  );
  const navigate = useNavigate();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        parseCSV(text);
        setCurrentFileName(file.name); 
      };
      reader.readAsText(file);
    } else {
      console.log("Please upload a valid CSV file.");
    }
  };

  const parseCSV = (text) => {
    Papa.parse(text, {
      header: true,
      complete: (results) => {
        const data = results.data;
        if (data.length > 0) {
          console.log("Parsed CSV data:", data); // Debugging line
          setCsvFiles([...csvFiles, data]);
        }
      },
    });
  };

  const handleFixAllIssues = () => {
    if (csvFiles.length > 0) {
      console.log("Navigating to document list with data:", csvFiles); // Debugging line
      navigate('/document-list', { state: { csvData: csvFiles[0] } }); // Passing CSV data
    } else {
      console.log("No CSV files uploaded.");
    }
  };

  return (
    <section>
      <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-teal-900 mb-4">
            Hello {userDisplayName}
          </h2>
          <Button 
            onClick={() => setCurrentFileName("")} 
            className="bg-teal-500 text-white"
          >
            Upload Another File
          </Button>
        </div>
        
        {!currentFileName ? (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-teal-300 border-dashed rounded-lg cursor-pointer bg-teal-50 hover:bg-teal-100 transition duration-300 ease-in-out"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-teal-500 mb-3" />
                <p className="mb-2 text-sm text-teal-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-teal-600">
                  CSV files only (MAX. 100MB)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        ) : (
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="font-medium text-teal-900">Upload Summary: {currentFileName}</h3>
            <div className="flex flex-col items-center mt-2">
              <Button onClick={handleFixAllIssues} className="bg-teal-500 text-white mb-2">
                Fix All Issues
              </Button>
            </div>
          </div>
        )}
      </section>
    </section>
  );
};

export default FileUpload;

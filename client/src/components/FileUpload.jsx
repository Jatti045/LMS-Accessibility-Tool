import React, { useState } from "react";
import { Upload } from "lucide-react";
import { useSelector } from "react-redux";
import Papa from "papaparse";
import { FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { useToast } from "@/hooks/use-toast"; 
import { useNavigate } from 'react-router-dom';

const FileUpload = () => {
  const [csvFiles, setCsvFiles] = useState([]);
  const [currentFileData, setCurrentFileData] = useState(null); // State to store current file data
  const [currentFileName, setCurrentFileName] = useState(""); // State to store the current file name
  const userDisplayName = useSelector(
    (state) => state.user.user?.displayName || "User"
  );

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        parseCSV(text);
        setCurrentFileName(file.name); // Store the current file name
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
        const totalIssuesCount = calculateTotalIssues(results.data);
        const criticalIssuesCount = calculateCriticalIssues(results.data);
        const overallScoreCount = calculateOverallScore(results.data);

        // Save the current file data
        const newFileData = {
          totalIssues: totalIssuesCount,
          criticalIssues: criticalIssuesCount,
          overallScore: overallScoreCount.toFixed(1),
        };

        setCsvFiles([...csvFiles, newFileData]);
        setCurrentFileData(newFileData); // Store the current file data
      },
    });
  };

  const calculateTotalIssues = (data) => {
    const issueFields = [
      "AlternativeText:2",
      "Contrast:2",
      "ImageSeizure:1",
      "LanguageCorrect:3",
      "LanguagePresence:3",
      "Ocred:2",
      "Parsable:1",
      "Scanned:1",
      "Security:1",
      "TableHeaders:2",
      "Tagged:2",
      "Title:3",
    ];

    return data.reduce((total, row) => {
      const rowIssues = issueFields.reduce(
        (sum, field) => sum + (parseInt(row[field], 10) || 0),
        0
      );
      return total + rowIssues;
    }, 0);
  };

  const calculateCriticalIssues = (data) => {
    const criticalIssueFields = ["AlternativeText:2", "Contrast:2"];

    return data.reduce((total, row) => {
      const rowCriticalIssues = criticalIssueFields.reduce(
        (sum, field) => sum + (parseInt(row[field], 10) || 0),
        0
      );
      return total + rowCriticalIssues;
    }, 0);
  };

  const calculateOverallScore = (data) => {
    let totalScore = 0;
    let count = 0;

    data.forEach((row) => {
      if (row.Score) {
        totalScore += parseFloat(row.Score);
        count++;
      }
    });

    return count > 0 ? (totalScore / count) * 100 : 0;
  };

  // Function to handle the "Fix All Issues" button click
  const navigate = useNavigate();

  const handleFixAllIssues = () => {
    console.log("Fixing all issues...");
    navigate('/document-list', { state: { csvData: parseCSV} });
    // Implement your logic for fixing all issues here
  };

  // Function to handle the "Fix Only Critical Issues" button click
  const handleFixCriticalIssues = () => {
    console.log("Fixing only critical issues...");
    // Implement your logic for fixing critical issues here
  };

  // Function to handle uploading another file
  const handleUploadAnotherFile = () => {
    setCurrentFileData(null); // Reset the current file data
    // Retain the current file name for history display
  };

  return (
    <section>
      <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-teal-900 mb-4">
            Hello {userDisplayName}
          </h2>
          <Button 
            onClick={handleUploadAnotherFile} 
            className="bg-teal-500 text-white"
          >
            Upload Another File
          </Button>
        </div>
        
        {!currentFileData ? ( // Conditionally render the upload section
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
        ) : ( // Render issue summary after file upload
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="font-medium text-teal-900">Upload Summary: {currentFileName}</h3>
            <div className="flex flex-col items-center text-sm text-teal-600">
              <span className="font-bold text-2xl">Total Issues: {currentFileData.totalIssues}</span> {/* Increased font size */}
              <div className="flex flex-col items-center mt-2">
                <Button onClick={handleFixAllIssues} className="bg-teal-500 text-white mb-2">
                  Fix All Issues
                </Button>
              </div>
              <div className="flex flex-col items-center mt-4">
                <AlertTriangle size={24} className="text-orange-500" />
                <span className="font-bold text-2xl">Critical Issues: {currentFileData.criticalIssues}</span> {/* Increased font size */}
                <Button onClick={handleFixCriticalIssues} className="bg-red-500 text-white mb-2">
                  Fix Only Critical Issues
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Upload History */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-teal-900 mb-4">
          Upload History
        </h2>
        <div className="space-y-4">
          {csvFiles.length > 0 ? csvFiles.map((csvFile, index) => (
            <div key={index} className="bg-teal-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="text-teal-700" size={20} />
                  <span className="font-medium text-teal-900">{currentFileName}</span> {/* Displaying the document name */}
                </div>
                <span className="text-sm font-medium text-teal-700">
                  Score: {csvFile.overallScore}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-teal-600">
                <span className="font-bold">Total Issues: {csvFile.totalIssues}</span>
                <div className="flex items-center space-x-1">
                  <AlertTriangle size={16} className="text-orange-500" />
                  <span className="font-bold">Critical Issues: {csvFile.criticalIssues}</span>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-center text-teal-600">No upload history available.</p>
          )}
        </div>
      </section>
    </section>
  );
};

export default FileUpload;

import React, { useState, useEffect } from "react";
import { Upload, FileText, ChevronRight, Calendar, X } from "lucide-react";
import { useSelector } from "react-redux";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

const FileUpload = () => {
  const [uploads, setUploads] = useState([]);
  const [csvFiles, setCsvFiles] = useState([]);
  const [parsedCSVData, setParsedCSVData] = useState(null); // New state for full CSV data
  const [currentFileData, setCurrentFileData] = useState(null); // Summary data
  const [currentFileName, setCurrentFileName] = useState("");
  const userDisplayName = useSelector(
    (state) => state.user.user?.displayName || "User"
  );
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUploadHistory = async () => {
      if (user) {
        const userId = user.uid;
        const q = query(
          collection(db, "userUploads"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);

        const uploadList = [];
        querySnapshot.forEach((doc) => {
          uploadList.push({ id: doc.id, ...doc.data() });
        });
        setCsvFiles(uploadList);
      }
    };

    fetchUploadHistory();
  }, [user]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      const fileName = file.name;
      setCurrentFileName(fileName);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        parseCSV(text, fileName);
      };
      reader.readAsText(file);
    } else {
      console.log("Please upload a valid CSV file.");
    }
  };

  const parseCSV = (text, fileName) => {
    Papa.parse(text, {
      header: true,
      complete: async (results) => {
        const totalIssuesCount = calculateTotalIssues(results.data);
        const criticalIssuesCount = calculateCriticalIssues(results.data);
        const overallScoreCount = calculateOverallScore(results.data);

        const newFileData = {
          totalIssues: totalIssuesCount,
          criticalIssues: criticalIssuesCount,
          overallScore: overallScoreCount.toFixed(1),
          date: new Date().toLocaleDateString(),
          fileName: fileName,
          userId: user.uid,
        };

        setParsedCSVData(results.data); // Store full parsed CSV data
        setCurrentFileData(newFileData); // Store summary data

        try {
          const docRef = await addDoc(
            collection(db, "userUploads"),
            newFileData
          );
          setCsvFiles([{ id: docRef.id, ...newFileData }, ...csvFiles]);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
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

  const handleFixAllIssues = () => {
    if (parsedCSVData) {
      navigate("/document-list", { state: { csvData: parsedCSVData } });
    } else {
      console.error("No file data available for navigation.");
    }
  };

  const handleFixCriticalIssues = () => {
    if (parsedCSVData) {
      navigate("/critical-list", { state: { csvData: parsedCSVData } });
    } else {
      console.error("No file data available for navigation.");
    }
  };

  const handleUploadAnotherFile = () => {
    setCurrentFileData(null);
    setParsedCSVData(null); // Reset parsed CSV data
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteDoc(doc(db, "userUploads", fileId));
      setCsvFiles(csvFiles.filter((file) => file.id !== fileId));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
        <CardHeader>
          <h2 className="text-2xl font-bold">Welcome, {userDisplayName}</h2>
        </CardHeader>
        <CardContent>
          <p className="text-teal-100">
            Upload and analyze your CSV files for accessibility issues.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-teal-900">File Upload</h2>
        </CardHeader>
        <CardContent>
          {!currentFileData ? (
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-teal-300 border-dashed rounded-lg cursor-pointer bg-teal-50 hover:bg-teal-100 transition duration-300 ease-in-out"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-teal-500 mb-3" />
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
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <FileText className="text-teal-700" size={40} />
                <div>
                  <h3 className="font-medium text-teal-900">
                    {currentFileName}
                  </h3>
                  <p className="text-sm text-teal-600">
                    Uploaded on {currentFileData.date}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-teal-700">
                    Overall Score
                  </span>
                  <span className="text-sm font-bold text-teal-900">
                    {currentFileData.overallScore}%
                  </span>
                </div>
                <Progress
                  value={parseFloat(currentFileData.overallScore)}
                  className="h-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-teal-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-teal-900 mb-2">
                      Total Issues
                    </h4>
                    <p className="text-3xl font-bold text-teal-700">
                      {currentFileData.totalIssues}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-red-900 mb-2">
                      Critical Issues
                    </h4>
                    <p className="text-3xl font-bold text-red-700">
                      {currentFileData.criticalIssues}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={handleFixAllIssues}
                  className="flex-1 bg-teal-500 hover:bg-teal-600"
                >
                  Fix All Issues
                </Button>
                <Button
                  onClick={handleFixCriticalIssues}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Fix Critical Issues
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUploadAnotherFile}
            variant="outline"
            className="w-full"
          >
            Upload Another File
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-teal-900">
            Upload History
          </h2>
        </CardHeader>
        <CardContent>
          {csvFiles.length > 0 ? (
            <ul className="space-y-4">
              {csvFiles.map((csvFile, index) => (
                <li key={index}>
                  <Card className="bg-teal-50 hover:bg-teal-100 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-teal-700" size={24} />
                          <div>
                            <h3 className="font-medium text-teal-900">
                              {csvFile.fileName.slice(0, 20)}
                            </h3>
                            <p className="text-sm text-teal-600 flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {csvFile.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-teal-700">
                            Score: {csvFile.overallScore}%
                          </p>
                          <p className="text-sm text-teal-600">
                            Issues: {csvFile.totalIssues} (
                            <span className="text-red-500">
                              {csvFile.criticalIssues} critical
                            </span>
                            )
                          </p>
                        </div>
                        <div className="flex justify-between flex-col ml-5 space-y-2">
                          <X
                            size={20}
                            className="text-gray-500 cursor-pointer hover:text-red-500"
                            onClick={() => handleDeleteFile(csvFile.id)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-teal-600">
              No upload history available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;

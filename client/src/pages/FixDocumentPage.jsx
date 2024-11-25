import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Upload,
  X,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Header from "@/components/Header";
import * as pdfjs from "pdfjs-dist";
import { Wrench } from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FixDocumentPage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [extractedContent, setExtractedContent] = useState(null);
  const [allyResults, setAllyResults] = useState("");
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const progressRef = useRef(null);

  useEffect(() => {
    if (location.state?.selectedFile && location.state?.csvData) {
      setFileName(location.state.selectedFile);
      processCSVData(location.state.selectedFile, location.state.csvData);
    }
  }, [location.state]);

  const processCSVData = (selectedFileName, csvData) => {
    if (!csvData || !csvData.length) {
      console.error("No CSV data available");
      return;
    }

    const selectedFileRow = csvData.find(
      (row) => row.Name === selectedFileName
    );
    if (!selectedFileRow) {
      console.error("Selected file not found in CSV data");
      return;
    }

    const headers = Object.keys(csvData[0]);
    const relevantHeaders = headers.slice(8);

    let results = "";
    relevantHeaders.forEach((header, index) => {
      results += `${header}= ${selectedFileRow[header]}`;
      if (index < relevantHeaders.length - 1) {
        results += ", ";
      }
    });

    console.log("AllyResults for", selectedFileName, ":", results);
    setAllyResults(results);
  };

  const extractPDFContent = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      let fullContent = {
        text: "",
        structure: {
          paragraphs: [],
          headers: [],
        },
      };

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        let pageText = "";
        let currentY = null;
        let currentParagraph = "";

        textContent.items.forEach((item) => {
          if (
            currentY !== null &&
            Math.abs(currentY - item.transform[5]) > 12
          ) {
            if (currentParagraph.trim()) {
              fullContent.structure.paragraphs.push(currentParagraph.trim());
              currentParagraph = "";
            }
          }

          currentY = item.transform[5];
          currentParagraph += item.str + " ";
          pageText += item.str + " ";

          if (item.height > 12) {
            fullContent.structure.headers.push(item.str.trim());
          }
        });

        if (currentParagraph.trim()) {
          fullContent.structure.paragraphs.push(currentParagraph.trim());
        }

        fullContent.text += pageText + "\n";
      }

      return fullContent;
    } catch (error) {
      console.error("Error extracting PDF content:", error);
      setFeedback(
        "Failed to extract content from the PDF. Please try another file."
      );
    }
  };

  const chatApiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(2) + " KB");
      const content = await extractPDFContent(file);
      setExtractedContent(content);
      setFeedback(null); // Reset feedback on new upload
    } else {
      console.log("Please upload a valid PDF file.");
      setFeedback("Invalid file type. Please upload a PDF document.");
    }
  };

  const handleAnalyzeFile = async () => {
    if (!pdfFile || !extractedContent) {
      console.error("No file uploaded or content extracted.");
      setFeedback("Please upload a PDF file before analyzing.");
      return;
    }

    setLoading(true);
    setFeedback(null);
    setProgress(0);

    // Simulate progress
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      // Create the combined prompt with accessibility metrics
      const combinedPrompt = `Below is the output of Ally's csv file describing which areas of the document have accessibility errors. All the headers are separated by commas (the last header does not have a comma at the end), and the values of each head is after = sign. Use the data to compare with accessibility issues found using https://www.federalregister.gov/documents/2024/04/24/2024-07758/nondiscrimination-on-the-basis-of-disability-accessibility-of-web-information-and-services-of-state." for accessibility guidelines. Give suggestions on where in the document issues are and how to fix them. Only provide suggestions for problems Ally's identified and make sure to include all the issues present. Provide the suggestions in Step by Step instructions list. The format of each issue found should be as follows: The title of each step Should be "Issue", number (starting from 1) and the name of the issue. The title should have # in front of it. Underneath the title, the first subheading will be Description. Subheadings should have ## in front of them. Underneath the Description subheading, provide the description of the issue. Under that have a subheading for Solution, and provide steps to fix the solution underneath the subheading. The steps should assume the user is not tech savvy and guide them through exactly how to fix the issue. Only provide the requested content and nothing else.

${allyResults}

Document content follows:
${extractedContent.text}`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${chatApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4-turbo",
            messages: [
              {
                role: "user",
                content: combinedPrompt,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      clearInterval(progressRef.current);
      setProgress(100);
      setFeedback(data.choices[0].message.content);
      navigate("/instructions", {
        state: { feedback: data.choices[0].message.content },
      });
    } catch (error) {
      console.error("Error analyzing file:", error);
      setFeedback(
        "An error occurred while analyzing the document. Please try again."
      );
    } finally {
      clearInterval(progressRef.current);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-3xl font-bold">Fix Document</h2>
            <Link to="/">
              <Button
                variant="ghost"
                className="text-white hover:text-teal-200 flex items-center"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Document Analysis
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-teal-100 text-lg">
              Review and fix accessibility issues in your documents seamlessly.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Card className="shadow-md bg-white rounded-lg">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-800">
              Upload Your PDF Document
            </h2>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="pdf-upload"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition duration-300 ${
                pdfFile
                  ? "border-green-500 bg-green-50"
                  : "border-teal-300 bg-gray-50 hover:border-teal-500"
              }`}
            >
              {pdfFile ? (
                <div className="flex flex-col items-center animate-fade-in">
                  <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                  <div className="flex items-center space-x-2">
                    <FileText className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="text-gray-700 font-medium">{fileName}</p>
                      <p className="text-gray-500 text-sm">{fileSize}</p>
                    </div>
                  </div>
                  <span className="text-gray-700 text-center px-4 mt-4">
                    Click to change the uploaded PDF file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-teal-500 mb-4" />
                  <span className="text-gray-700 text-center px-4">
                    Click or drag your PDF document here to upload
                  </span>
                </div>
              )}
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            {fileName && (
              <div className="mt-6 flex flex-col items-start">
                <Button
                  onClick={handleAnalyzeFile}
                  className="mt-4 bg-teal-500 hover:bg-teal-600 text-white flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Wrench className="mr-2 h-5 w-5" />
                      Analyze Document
                    </>
                  )}
                </Button>
                {loading && (
                  <div className="w-full mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-teal-700">
                        Analyzing...
                      </span>
                      <span className="text-sm font-medium text-teal-700">
                        {Math.floor(progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {feedback && (
              <div className="mt-6 p-4 bg-white rounded-lg shadow-md relative">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setFeedback(null)}
                  aria-label="Close feedback"
                >
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Analysis Feedback
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-gray-700">
                    {feedback}
                  </pre>
                </div>
              </div>
            )}
            {(feedback === "Invalid file type. Please upload a PDF document." ||
              feedback === "Please upload a PDF file before analyzing.") && (
              <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  <span>{feedback}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center text-gray-700 hover:text-teal-500"
              onClick={() => {
                setPdfFile(null);
                setFileName("");
                setFileSize("");
                setExtractedContent(null);
                setFeedback(null);
                setProgress(0);
              }}
              disabled={loading}
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload New File
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default FixDocumentPage;

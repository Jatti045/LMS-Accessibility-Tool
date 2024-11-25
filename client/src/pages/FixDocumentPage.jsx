import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Wrench,
    ArrowLeft,
} from "lucide-react";
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FixDocumentPage = () => {
    const [pdfFile, setPdfFile] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const [extractedContent, setExtractedContent] = useState(null);
    const [allyResults, setAllyResults] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

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

        const selectedFileRow = csvData.find(row => row.Name === selectedFileName);
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
                text: '',
                structure: {
                    paragraphs: [],
                    headers: [],
                }
            };

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                let pageText = '';
                let currentY = null;
                let currentParagraph = '';

                textContent.items.forEach((item) => {
                    if (currentY !== null && Math.abs(currentY - item.transform[5]) > 12) {
                        if (currentParagraph.trim()) {
                            fullContent.structure.paragraphs.push(currentParagraph.trim());
                            currentParagraph = '';
                        }
                    }
                    
                    currentY = item.transform[5];
                    currentParagraph += item.str + ' ';
                    pageText += item.str + ' ';

                    if (item.height > 12) {
                        fullContent.structure.headers.push(item.str.trim());
                    }
                });

                if (currentParagraph.trim()) {
                    fullContent.structure.paragraphs.push(currentParagraph.trim());
                }

                fullContent.text += pageText + '\n';
            }

            return fullContent;
        } catch (error) {
            console.error('Error extracting PDF content:', error);
        }
    };
    
    const chatApiKey = import.meta.env.VITE_OPENAI_API_KEY;

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            setFileName(file.name);
            const content = await extractPDFContent(file);
            setExtractedContent(content);
        } else {
            console.log("Please upload a valid PDF file.");
        }
    };

    const handleAnalyzeFile = async () => {
        if (!pdfFile || !extractedContent) {
            console.error("No file uploaded or content extracted.");
            return;
        }

        setLoading(true);

        try {
            // Create the combined prompt with accessibility metrics
            const combinedPrompt = `Below is the output of Ally's csv file describing which areas of the document have accessibility errors. All the headers are seperated by commas (the last header does not have a comma at the end), and the values of each head is after = sign. Use the data to compare with accessibility issues found using https://www.federalregister.gov/documents/2024/04/24/2024-07758/nondiscrimination-on-the-basis-of-disability-accessibility-of-web-information-and-services-of-state." for accessibility guidelines. Give suggestions on where in the document issues are and how to fix them. Only provide suggestions for problems Ally's identified and make sure to include all the issues present. Provide the suggestions in Step by Step instructions list. The format of each issue found should be as follows: The title of each step Should be "Issue", number (starting from 1) and the name of the issue. The title should have # infront of it. Underneath the title, the first subheading will be Description. Subheadings should have ## infront of them. Underneath the Description subheading, provide the description of the issue. Under that have a subheading for Solution, and provide steps to fix the solution underneath the subheading. The steps should assume the user is not tech savvy and guide them through exactly how to fix the issue. Only provide the requested content and nothing else.  
            ${allyResults}

            Document content follows:
            ${extractedContent.text}`;

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${chatApiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        { 
                            role: "user", 
                            content: combinedPrompt
                        }
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            navigate("/instructions", { state: { feedback: data.choices[0].message.content } });
            setFeedback(data.choices[0].message.content);
        } catch (error) {
            console.error("Error analyzing file:", error);
            setFeedback("An error occurred while analyzing the document. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
            <Header />
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-bold">Fix Document</h2>
                        <Link to="/">
                            <Button variant="ghost" className="text-white hover:text-teal-600">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Document Analysis
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <p className="text-teal-100">
                            Review and fix accessibility issues in your documents
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="max-w-4xl mx-auto p-6 space-y-8">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Fix Document</h2>
                    </CardHeader>
                    <CardContent>
                        <label
                            htmlFor="pdf-upload"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:border-teal-400"
                        >
                            <Upload className="w-12 h-12 text-teal-500 mb-3" />
                            <span>Please upload the {fileName || "PDF document"} file</span>
                            <input
                                id="pdf-upload"
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                        {fileName && (
                            <div className="mt-4">
                                <p className="text-lg font-medium">{fileName}</p>
                                <Button
                                    onClick={handleAnalyzeFile}
                                    className="mt-2 bg-teal-500 hover:bg-teal-600"
                                >
                                    Analyze Document
                                </Button>
                                {loading && <p>Loading analysis...</p>}
                            </div>
                        )}
                        {feedback && (
                            <div className="mt-4">
                                <h3 className="font-semibold">Analysis Feedback</h3>
                                <p>{feedback}</p>
                                <X className="cursor-pointer" onClick={() => setFeedback(null)} />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => {
                                setPdfFile(null);
                                setFileName("");
                                setExtractedContent(null);
                            }}
                        >
                            Upload new file
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default FixDocumentPage;
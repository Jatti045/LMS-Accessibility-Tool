    import React, { useState } from "react";
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

    const FixDocumentPage = () => {
        const [pdfFile, setPdfFile] = useState(null);
        const [feedback, setFeedback] = useState(null);
        const [loading, setLoading] = useState(false);
        const [fileName, setFileName] = useState("");

        const handleFileUpload = (event) => {
            const file = event.target.files[0];
            if (file && file.type === "application/pdf") {
                setPdfFile(file);
                setFileName(file.name);
            } else {
                console.log("Please upload a valid PDF file.");
            }
        };

        const handleAnalyzeFile = async () => {
            if (!pdfFile) {
                console.error("No file uploaded.");
                return;
            }

            setLoading(true);

            // Simulated text for testing purposes
            const simulatedText = "GNG2101: Personal Reflection 2 – Ethical Generative AI Read the Article: The Limitations and Ethical Considerations of ChatGPT focusing on sections 3 and 4. (https://direct.mit.edu/dint/article/6/1/201/118839/The-Limitations-and-Ethical-Considerations-of) Write a personal reflection by sharing an ethical implication regarding your previous use of generative AI. (ChatGPT, Copilot, OPEN AI, DALL-E, other). Delve into your experience by referring to some of the ethical lenses discussed in class as well as the MIT Article you have read in preparation for this reflection. Your audience for this reflection is a future GNG2101/2501 student. You are writing a blog post for them to read. You might even begin with “Dear GNG2101/2501 Student…”. Your story should include the following: 1. What. Tell a short story about what happened. Illustrate your story using descriptive details like observations, quotes, actions taken, dialog, expressions of emotion, etc. By \"observation”, we mean what you observed with all your five senses, as well as what you felt or what you may have perceived. Don’t just report on the experience; share the story in a way that allows the reader to be transported to the scene. Remember, your audience may not be familiar with the specific context of your situation to reading this reflection. Therefore, with a sentence or two, orient your reader towards the purpose of your previous use of generative AI and what you were tasked to do. 2. So what. This section of your reflection should focus on your interpretations, analyses, and meaning making. Use at least 2 different ethical lenses discussed in class to analyze your decision to use (or not) generative AI and for what objectives. Make sure to identify and explain the \"why\" behind the importance of your lesson that can be learned from your experience with generative AI. Make references to the MIT Article to support your analysis. 3. Now what. This part of your reflective work should concentrate on the bigger picture and applying the ethical lessons learned to practice, including (but not limited to) planning next steps in your use of generative AI, if appropriate, and especially generalizable suggestions for your audience. You may want to ponder such questions as \"What are my next steps?\" or \"Knowing what I know now, what generalizable insights do I have to share?\" or “What will I do differently as a designer (or as a person!) now that I know this?” Discuss the applicability of your generalization to other situations and other design students. Also, remember that every lesson has its limitations. Consider how portable this lesson is to other designers working in other contexts with other stakeholders. 4. Looks like. Provide images in your submission that represent your story visually, which could be a photo from your visits, a sketch of your own, a photo found online with an appropriate citation, etc. Make sure your text explains your image. Your reflection should be no more than 500 words. Submission: Upload your reflection to Brightspace. Be creative with your reflection, you can use a blog or a vlog format or just submit as a PDF. Please remember to include a descriptive title, your name and the reflection date in your submission. You are the creator of this new knowledge, at a particular moment in your education, and you should absolutely acknowledge it as such.";;

            // Call your ChatGPT API with the simulated text
            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${import.meta.env.VITE_CHATGPT_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo", // Adjust the model as needed
                        messages: [
                            { role: "user", content: "Here is a document for analysis. Check for any accesibility issues according to the guidlines provided by https://www.federalregister.gov/documents/2024/04/24/2024-07758/nondiscrimination-on-the-basis-of-disability-accessibility-of-web-information-and-services-of-state." },
                            { role: "user", content: simulatedText }, // Using simulated text here
                        ],
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setFeedback(data.choices[0].message.content); // Adjust according to API response structure
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
              <Button
                variant="ghost"
                className="text-white hover:text-teal-600"
              >
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
                        <Button variant="outline" className="w-full" onClick={() => setPdfFile(null)}>
                            Upload new file
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            </div>
        );
    };

    export default FixDocumentPage;

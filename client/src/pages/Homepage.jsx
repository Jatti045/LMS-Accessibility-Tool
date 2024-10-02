import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import UploadHistory from "@/components/UploadHistory";
import { useState } from "react";

const Homepage = () => {
  const [history, setHistory] = useState([
    {
      id: 1,
      name: "Syllabus.pdf",
      accessibilityScore: 85,
      totalIssues: 5,
      criticalIssues: 2,
    },
    {
      id: 2,
      name: "Lecture1.pptx",
      accessibilityScore: 92,
      totalIssues: 3,
      criticalIssues: 1,
    },
    {
      id: 3,
      name: "Assignment1.docx",
      accessibilityScore: 78,
      totalIssues: 7,
      criticalIssues: 3,
    },
    {
      id: 4,
      name: "Quiz2.pdf",
      accessibilityScore: 88,
      totalIssues: 4,
      criticalIssues: 2,
    },
    {
      id: 5,
      name: "ProjectOverview.pptx",
      accessibilityScore: 95,
      totalIssues: 2,
      criticalIssues: 0,
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FileUpload />
        <UploadHistory history={history} />
      </main>
    </div>
  );
};

export default Homepage;

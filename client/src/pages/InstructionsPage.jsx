import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Header from "@/components/Header";

const InstructionsPage = () => {
  const location = useLocation();
  const feedback = location.state?.feedback || "No feedback available.";
  const [expandedSections, setExpandedSections] = useState({});

  // Parse feedback into structured sections
  const parseSections = (text) => {
    const sectionRegex = /^# Issue (\d+): (.+)$/gm;
    const sections = [];
    let match;

    while ((match = sectionRegex.exec(text)) !== null) {
      const [fullMatch, number, title] = match;
      const startIndex = text.indexOf(fullMatch) + fullMatch.length;
      const nextSectionMatch = text.slice(startIndex).match(/^# Issue \d+/m);

      const content = nextSectionMatch
        ? text.slice(startIndex, text.indexOf(nextSectionMatch[0], startIndex))
        : text.slice(startIndex);

      sections.push({
        number,
        title,
        content: content.trim(),
      });
    }

    return sections;
  };

  const sections = parseSections(feedback);

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      <Header />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8" />
              <h2 className="text-3xl font-bold">Accessibility Analysis</h2>
            </div>
            <Link to="/">
              <Button
                variant="ghost"
                className="text-white hover:text-teal-600 flex items-center"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Upload
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-teal-100 text-lg">
              Detailed breakdown of accessibility issues found in your document.
            </p>
          </CardContent>
        </Card>

        {sections.length > 0 ? (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow duration-300"
              >
                <CardHeader
                  className="cursor-pointer flex flex-row justify-between items-center"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center space-x-4">
                    <AlertCircle className="h-6 w-6 text-teal-500" />
                    <h3 className="text-xl font-semibold">
                      Issue {section.number}: {section.title}
                    </h3>
                  </div>
                  {expandedSections[index] ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </CardHeader>
                {expandedSections[index] && (
                  <CardContent className="bg-gray-50 rounded-b-lg">
                    <div className="prose max-w-none text-gray-800">
                      {section.content.split("\n").map((line, lineIndex) => {
                        if (line.startsWith("## Description")) {
                          return (
                            <h4
                              key={lineIndex}
                              className="text-lg font-semibold text-teal-600 mt-4 mb-2"
                            >
                              Description
                            </h4>
                          );
                        }
                        if (line.startsWith("## Solution")) {
                          return (
                            <h4
                              key={lineIndex}
                              className="text-lg font-semibold text-teal-600 mt-4 mb-2"
                            >
                              Solution
                            </h4>
                          );
                        }
                        return line ? (
                          <p key={lineIndex} className="mb-2">
                            {line}
                          </p>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-xl">
                No accessibility issues were detected in the document.
              </p>
              <ClipboardCheck className="mx-auto h-16 w-16 text-green-500 mt-4" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InstructionsPage;

import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Wrench,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CriticalListPage = () => {
  const location = useLocation();
  const { csvData } = location.state || { csvData: [] };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const parseDocumentData = () => {
    if (!Array.isArray(csvData)) return [];

    // Define critical issue columns
    const criticalIssueColumns = ["AlternativeText:2", "Contrast:2"];

    return csvData
      .map((row) => {
        const criticalIssues = criticalIssueColumns.reduce(
          (sum, column) => sum + (parseInt(row[column], 10) || 0),
          0
        );

        return {
          name: row.Name || "Untitled",
          url: row.Url || "#",
          issues: criticalIssues,
          score: row.Score ? parseFloat(row.Score) * 100 : 0,
        };
      })
      .filter((doc) => doc.issues > 0); // Exclude documents with 0 critical issues
  };

  const documents = parseDocumentData().sort((a, b) => b.issues - a.issues);
  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const paginatedDocuments = documents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-bold">Critical Issues Analysis</h2>
            <Link to="/">
              <Button
                variant="ghost"
                className="text-white hover:text-teal-600"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Upload
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-teal-100">
              Review and fix critical accessibility issues in your documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold text-teal-900">
              Documents with Critical Issues
            </h3>
          </CardHeader>
          <CardContent>
            {paginatedDocuments.length === 0 ? (
              <div className="text-center py-8 text-teal-600">
                No documents found with critical issues.
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedDocuments.map((doc, index) => (
                  <Card
                    key={index}
                    className="bg-teal-50 hover:bg-teal-100 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-teal-900 mb-1">
                            {doc.name}
                          </h4>
                          <p className="text-sm text-teal-600">
                            Score: {doc.score.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium text-red-600">
                            {doc.issues} critical issues found
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-teal-600 hover:text-teal-700"
                            onClick={() => window.open(doc.url, "_blank")}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            className="bg-teal-500 hover:bg-teal-600 text-white"
                          >
                            <Wrench className="h-4 w-4 mr-1" />
                            Fix Issues
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex justify-between items-center pt-6">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="text-teal-600"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-teal-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="text-teal-600"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CriticalListPage;

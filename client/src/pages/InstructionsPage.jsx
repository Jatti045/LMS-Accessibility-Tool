import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { ArrowLeft } from "lucide-react";

const InstructionsPage = () => {
    const location = useLocation();
    const feedback = location.state?.feedback || "No feedback available.";

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
            <Header />
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-bold">Analysis Results</h2>
                        <Link to="/">
                            <Button variant="ghost" className="text-white hover:text-teal-600">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <p className="text-teal-100">
                            Below are the results of the document analysis for accessibility issues.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Feedback</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="text-gray-700 whitespace-pre-wrap">
                            {feedback}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InstructionsPage;

import React from "react";
import { useLocation, Link } from "react-router-dom";

const DocumentListPage = () => {
  const location = useLocation();
  const { csvData } = location.state || { csvData: [] };

  const calculateTotalIssues = (row) => {
    const issueFields = Object.keys(row).filter(key => 
      key.includes(':') && !isNaN(parseInt(row[key], 10))
    );
    
    return issueFields.reduce((total, field) => {
      return total + (parseInt(row[field], 10) || 0);
    }, 0);
  };

  const documents = csvData.slice(1).map((row) => ({
    name: row.Name,
    url: row.Url,
    totalIssues: calculateTotalIssues(row),
  }));

  documents.sort((a, b) => a.totalIssues - b.totalIssues);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-teal-900 mb-4">
          Document List
        </h2>
        {documents.length === 0 ? (
          <p>No documents found.</p>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="border px-4 py-2">Document Name</th>
                <th className="border px-4 py-2">Total Issues</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{doc.name}</td>
                  <td className="border px-4 py-2">{doc.totalIssues}</td>
                  <td className="border px-4 py-2">
                    <a
                      href={doc.url}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                      download
                    >
                      Download Now
                    </a>
                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                      Fix Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Link to="/" className="mt-4 inline-block text-teal-600">
          Go Back
        </Link>
      </div>
    </div>
  );
};

export default DocumentListPage;
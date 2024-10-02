import { FileText, AlertTriangle } from "lucide-react";

const UploadHistory = ({ history }) => (
  <section className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-xl font-semibold text-teal-900 mb-4">Upload History</h2>
    <div className="space-y-4">
      {history.map((item) => (
        <div key={item.id} className="bg-teal-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FileText className="text-teal-700" size={20} />
              <span className="font-medium text-teal-900">{item.name}</span>
            </div>
            <span className="text-sm font-medium text-teal-700">
              Score: {item.accessibilityScore}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-teal-600">
            <span>Total Issues: {item.totalIssues}</span>
            <div className="flex items-center space-x-1">
              <AlertTriangle size={16} className="text-orange-500" />
              <span>Critical Issues: {item.criticalIssues}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default UploadHistory;

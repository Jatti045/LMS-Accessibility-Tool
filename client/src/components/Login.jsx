import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { LucideBookOpen } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-100 to-blue-100">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <LucideBookOpen className="h-10 w-10 text-teal-900" />{" "}
            <h1 className="text-2xl font-bold text-teal-900">AccessBridge</h1>
          </div>
          <p className="text-center text-teal-700 mb-8">
            Enhancing course accessibility with ease
          </p>

          <div className="mb-8 space-y-4">
            <FeatureItem text="Seamless Canvas Integration" />
            <FeatureItem text="Accessibility Insights" />
            <FeatureItem text="Easy-to-use Interface" />
          </div>

          <button className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 hover:scale-105 transition ease-in-out duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-teal-500">
            Login with Canvas
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </button>
        </div>
        <div className="bg-teal-50 p-4">
          <p className="text-center text-teal-700 text-sm">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }) => (
  <div className="flex items-center">
    <FontAwesomeIcon
      icon={faCheckCircle}
      className="text-teal-500 mr-3 text-xl"
    />
    <span className="text-teal-800">{text}</span>
  </div>
);

export default Login;

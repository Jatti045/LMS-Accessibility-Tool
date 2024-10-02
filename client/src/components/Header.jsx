import { LucideBookOpen, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => (
  <header className="bg-white shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <LucideBookOpen className="h-8 w-8 text-teal-900" />
        <h1 className="text-2xl font-bold text-teal-900">AccessBridge</h1>
      </div>
      <button className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition duration-300 ease-in-out">
        <LogOut size={18} />
        <Link to="/">
          <span onClick={() => Navigate("/")}>Sign Out</span>
        </Link>
      </button>
    </div>
  </header>
);

export default Header;

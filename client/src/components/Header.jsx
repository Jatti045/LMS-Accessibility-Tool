import React from "react";
import { LucideBookOpen, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { useDispatch } from "react-redux";
import { clearUser } from "./app/features/userSlice";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
      console.log("Success");
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <LucideBookOpen className="h-8 w-8 text-teal-900" />
          <h1 className="text-2xl font-bold text-teal-900">AccessBridge</h1>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition duration-300 ease-in-out"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

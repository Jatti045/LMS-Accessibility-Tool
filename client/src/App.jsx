import React, { useEffect, useState } from "react";
import { Toaster } from "./components/ui/toaster";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginSignupPage";
import Homepage from "./pages/Homepage";
import DocumentListPage from "./pages/DocumentListPage";
import FixDocumentPage from "./pages/FixDocumentPage";
import InstructionsPage from "./pages/InstructionsPage";
import { auth } from "./components/firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./components/app/features/userSlice";
import { Loader2 } from "lucide-react";
import CriticalListPage from "./pages/CriticalListPage";
import ChatBot from "./components/ChatBot";

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch(
          setUser({
            email: user.email,
            displayName: user.displayName,
          })
        );
      } else {
        dispatch(clearUser());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center min-h-screen items-center">
        <Loader2 className="animate-spin size-20 text-teal-200"></Loader2>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={user ? <Homepage /> : <LoginPage />} />
        <Route path="/homepage" element={user ? <Homepage /> : <LoginPage />} />
        <Route
          path="/document-list"
          element={user ? <DocumentListPage /> : <Homepage />}
        />
        <Route
          path="/critical-list"
          element={user ? <CriticalListPage /> : <Homepage />}
        />
        <Route
          path="/fix-document"
          element={user ? <FixDocumentPage /> : <Homepage />}
        />
        <Route path="/" element={<FixDocumentPage />} 
        />
        <Route path="/instructions" element={<InstructionsPage />} 
        />
      </Routes>
      <ChatBot />
    </>
  );
}

export default App;

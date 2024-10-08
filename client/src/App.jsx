import React, { useEffect, useState } from "react";
import { Toaster } from "./components/ui/toaster";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginSignupPage";
import Homepage from "./pages/Homepage";
import DocumentListPage from "./pages/DocumentListPage"; // Import the new component
import { auth } from "./components/firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./components/app/features/userSlice";
import { Loader2 } from "lucide-react";

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
          element={user ? <DocumentListPage /> : <Navigate to="/" replace />} 
        />
      </Routes>
    </>
  );
}

export default App;
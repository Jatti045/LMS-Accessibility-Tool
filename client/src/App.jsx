import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Homepage from "./pages/Homepage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/homepage" element={<Homepage />} />
    </Routes>
  );
}

export default App;

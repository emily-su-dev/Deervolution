import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Activity from "./pages/Activity.tsx";
import Picture from "./pages/Picture";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/picture" element={<Picture />} />
      </Routes>
    </Router>
  );
}

export default App;

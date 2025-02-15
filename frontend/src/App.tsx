import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home.tsx";
import Activity from "./pages/Activity/Activity.tsx";
import Picture from "./pages/Picture/Picture.tsx";

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

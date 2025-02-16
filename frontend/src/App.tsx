import './App.css';
import SignIn from './pages/SignIn/SignIn';
import SignUp from './pages/SignUp/SignUp';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Activity from "./pages/Activity/Activity";
import Home from "./pages/Home/Home";
import Picture from "./pages/Picture/Picture";
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/activity" element={<ProtectedRoute element={<Activity />} />} />
          <Route path="/picture" element={<ProtectedRoute element={<Picture />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

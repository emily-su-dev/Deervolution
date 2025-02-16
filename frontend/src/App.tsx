import { useEffect, useState } from 'react';
import './App.css';
import SignIn from './pages/SignIn/SignIn';
import SignUp from './pages/SignUp/SignUp';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Activity from "./pages/Activity/Activity";
import Home from "./pages/Home/Home";
import Picture from "./pages/Picture/Picture";
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Define the interface for your data
interface AccountData {
  userid: string;
  deers: number;
  geese: number;
  racoons: number;
  squirrels: number;
  sparrow: number;
}
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

function App() {
  const [data, setData] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/data`);
        const fetchedData = await response.json();
        setData(fetchedData);
        console.log('Fetched data: ', fetchedData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) return <p>Loading...</p>
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

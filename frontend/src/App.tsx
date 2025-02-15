import { useEffect, useState } from 'react';
import { fetchData } from '../../backend/supabaseService'; // Import fetchData
import './App.css';
import SignIn from './pages/SignIn/SignIn.tsx';
import SignUp from './pages/SignUp/SignUp.tsx';

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Activity from "./pages/Activity/Activity.tsx";
import Home from "./pages/Home/Home.tsx";
import Picture from "./pages/Picture/Picture.tsx";

function App() {
  const [count, setCount] = useState(0);

  // Define the type of 'data' to match the structure you expect from Supabase
  const [data, setData] = useState<Array<{ 
    userid: string;  
    deers: number;
    geese: number;
    racoons: number;
    squirrels: number;
    sparrow: number;
   }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const fetchedData = await fetchData();  // Call the fetchData function
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
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />        
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/picture" element={<Picture />} />
      </Routes>
    </Router>
  );
}

export default App;

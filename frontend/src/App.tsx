import { useEffect, useState } from 'react';
import { fetchData } from '../../backend/supabaseService'; // Import fetchData
import './App.css';
import SignUp from './SignUp';

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
    <>
      <div>
        <SignUp/>
      </div>
    </>
  );
}

export default App;

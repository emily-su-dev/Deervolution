import { useEffect, useState } from 'react';
import './App.css';
import SignUp from './SignUp';

import { createClient } from '@supabase/supabase-js';

// Define environment variables with fallback handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY ?? '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [count, setCount] = useState(0);

  // Define the type of 'data' to match the structure you expect from Supabase
  const [data, setData] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('test_table').select('*');
      if (error) {
        console.error('Error fetching data:', error);
      } else {
        console.log('Data:', data); // Check the console for fetched data
        setData(data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div>
        <SignUp/>
      </div>
    </>
  );
}

export default App;

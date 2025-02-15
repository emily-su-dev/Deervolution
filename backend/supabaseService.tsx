// In supabaseService.ts
import { supabase } from './supabaseClient';

export interface AccountData {
  userid: string; // UUID as string
  deers: number;
  geese: number;
  racoons: number;
  squirrels: number;
  sparrow: number;
}

export const fetchData = async (): Promise<AccountData[]> => {
  console.log("Fetching data from Supabase...");
  
  const { data, error } = await supabase.from('accountdatabase').select('*');  // Ensure you're querying the correct table
  if (error) {
    console.error('Error fetching data:', error);
    throw error;  // Throw error for handling in the App component
  }

  console.log("Fetched data:", data);  // Log the fetched data for debugging
  return data as AccountData[];
};

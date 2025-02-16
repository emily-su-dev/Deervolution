// In supabaseService.js
const { supabase } = require('./supabaseClient');

const fetchData = async () => {
  console.log("Fetching data from Supabase...");

  const { data, error } = await supabase.from('accountdatabase').select('*');  
  if (error) {
    console.error('Error fetching data:', error);
    throw error;
  }

  console.log("Fetched data:", data);
  return data;
};

module.exports = { fetchData };

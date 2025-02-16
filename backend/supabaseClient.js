const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
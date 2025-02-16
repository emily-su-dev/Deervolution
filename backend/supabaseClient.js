const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl ="https://jtoizyannctdzsgkepmy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0b2l6eWFubmN0ZHpzZ2tlcG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MDEzMzcsImV4cCI6MjA1NTE3NzMzN30.tXCwQKmqypE3WU0xjnlj3_BehsXSDLbxbo6yu3qillo";

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
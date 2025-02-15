import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";
import { Link } from "react-router-dom";

// Define Supabase client types

// Initialize Supabase client
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey: string = import.meta.env.VITE_SUPABASE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or API key is missing.');
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const signUpUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!email || !password) {
      setMessage("Email and password are required.");
      return;
    }
  
    // Step 1: Check if email already exists in 'accountdatabase'
    const { data: existingUser, error: userCheckError } = await supabase
      .from("accountdatabase")
      .select("userid")
      .eq("userid", email); // Check if the email already exists in 'accountdatabase'
  
    if (userCheckError) {
      setMessage(`Error checking if email exists: ${userCheckError.message}`);
      return;
    }
  
    if (existingUser && existingUser.length > 0) {
      // If email exists, stop and display message
      setMessage("This email is already registered. Please sign in.");
      return;
    }
  
    // Step 2: Sign up user with Supabase auth
    const { data, error } = await supabase.auth.signUp({ email, password });
  
    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }
  
    console.log("User created:", data);
    setMessage("Sign-up successful! Check your email for verification.");
  
    // Step 3: Insert new row into 'accountdatabase'
    const { error: insertError } = await supabase
      .from("accountdatabase") // Ensure this is your actual table name
      .insert([{ userid: email }]); // Other columns will use default values
  
    if (insertError) {
      console.error("Error inserting user into accountdatabase:", insertError.message);
    } else {
      console.log("User successfully added to accountdatabase");
    }
  
    // Step 4: Create a new table for the user dynamically
    try {
      const sanitizedEmail = email.replace('@', '_').replace('.', '_');
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${sanitizedEmail}_animal_history (
          id SERIAL PRIMARY KEY,
          animal_type TEXT NOT NULL,
          date_time TIMESTAMPTZ NOT NULL DEFAULT now(),
          location TEXT NOT NULL
        );
      `;
  
      // Call the run_sql function
      const { error: tableError } = await supabase.rpc('run_sql', {
        query: createTableQuery
      });
  
      if (tableError) {
        console.error("Error creating user-specific table:", tableError.message);
      } else {
        console.log(`Table for ${email} created successfully!`);
      }
    } catch (err) {
      console.error("Error executing dynamic SQL:", err);
    }
  };
  
  
  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={signUpUser}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
        <p>
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SignUp;

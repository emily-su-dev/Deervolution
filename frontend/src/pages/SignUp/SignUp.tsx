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

  const checkIfEmailExists = async (email: string) => {
    const { data, error } = await supabase
      .from("Users") // Assuming 'users' is your table name
      .select("email")
      .eq("email", email); // Check if the email already exists in the database

    if (error) {
      setMessage(`Error checking email: ${error.message}`);
      return true;
    }
    return data?.length > 0; // If data is not empty, email already exists
  };
  

  const signUpUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 

    console.log(supabase);
    console.log(email);
    console.log(supabaseUrl);
    console.log(supabaseKey);

    const emailExists = await checkIfEmailExists(email);
    console.log(emailExists);
    if(emailExists){
      setMessage("This email is already registered.");
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Sign-up successful! Check your email for verification."); 

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

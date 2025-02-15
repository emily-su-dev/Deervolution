import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Initialize Supabase client
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey: string = import.meta.env.VITE_SUPABASE_KEY as string;
const supabase:SupabaseClient = createClient(supabaseUrl, supabaseKey);

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate(); // Initialize useNavigate hook

  // Handle the sign-in process
  const signInUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload

    // Sign in the user with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Sign-in successful!");
      
      // After successful sign-in, navigate to the home page
      navigate("/home");
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={signInUser}>
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
        <button type="submit">Sign In</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SignIn;

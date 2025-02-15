import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";
import { Link } from "react-router-dom";

import logo from "../../assets/deervolution_logo.png";
import upper from "../../assets/deerv_upper_decor.png";

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
      <img src={upper} alt="Upper Decor" className="upper-decor" />
      <img src={logo} alt="Deervolution Logo" className="logo" />
      
      <h1>Sign In</h1>
      <form onSubmit={signInUser}>
        <div className="email-container">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="password-container">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>  
        
        <button type="submit">Sign In</button>

        <p>
          Don't have an account? <Link to="/SignUp">Sign Up</Link>
        </p>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SignIn;

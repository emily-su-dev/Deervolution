import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

// Define Supabase client types
interface SupabaseClient {
  auth: {
    signUp: (params: { email: string; password: string }) => Promise<{ error: Error | null }>;
  };
}

// Initialize Supabase client
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey: string = import.meta.env.VITE_SUPABASE_KEY as string;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const signUpUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
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
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SignUp;

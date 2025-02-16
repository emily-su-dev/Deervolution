import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey: string = import.meta.env.VITE_SUPABASE_KEY as string;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ 
  isAuthenticated: false, 
  loading: true,
  user: null 
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 
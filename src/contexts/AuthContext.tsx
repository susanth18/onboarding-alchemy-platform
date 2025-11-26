import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  userRole: 'hr' | 'employee' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy user for development - bypassing auth
const DUMMY_USER: User = {
  id: "11111111-1111-1111-1111-111111111111",
  app_metadata: {},
  user_metadata: { role: 'hr' },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "demo@example.com",
  phone: ""
} as User;

const DUMMY_SESSION: Session = {
  access_token: "dummy_token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "dummy_refresh_token",
  user: DUMMY_USER
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DUMMY_USER);
  const [session, setSession] = useState<Session | null>(DUMMY_SESSION);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'hr' | 'employee' | null>('hr');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // We are bypassing auth, so we just set the dummy user and role
    setUser(DUMMY_USER);
    setSession(DUMMY_SESSION);
    setUserRole('hr');
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Dummy implementation
    toast({
      title: "Signed in (Bypassed)",
      description: "You are using the demo account.",
    });
    navigate('/');
  };

  const signUp = async (email: string, password: string, userData: any) => {
    // Dummy implementation
    toast({
      title: "Account created (Bypassed)",
      description: "You are using the demo account.",
    });
    navigate('/');
  };

  const signOut = async () => {
    // Dummy implementation - maybe reload page or just do nothing
    toast({
      title: "Signed out",
      description: "This is a demo, you cannot really sign out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

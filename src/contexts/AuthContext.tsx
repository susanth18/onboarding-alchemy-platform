import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
    [key: string]: any;
  };
  app_metadata?: {
    [key: string]: any;
  };
  aud?: string;
  created_at?: string;
}

export interface Session {
  access_token: string;
  user: User;
}

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<'hr' | 'employee' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check local storage for session
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        setUser(parsedSession.user);
        
        // Determine role
        if (parsedSession.user.role === 'employee' || (parsedSession.user.user_metadata && parsedSession.user.user_metadata.role === 'employee')) {
            setUserRole('employee');
        } else {
            setUserRole('hr');
        }
      } catch (e) {
        console.error("Failed to parse session", e);
        localStorage.removeItem('session');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
        const data = await api.login(email, password);
        const { user, session } = data;
        
        // Standardize user object structure for internal use
        // Backend returns { user: { id, role, email }, session: { access_token } }
        // We want to match the structure we defined in User interface
        const userObj: User = {
            id: user.id,
            email: user.email,
            user_metadata: { role: user.role }
        };
        
        const sessionObj: Session = {
            access_token: session.access_token,
            user: userObj
        };

        setSession(sessionObj);
        setUser(userObj);
        localStorage.setItem('session', JSON.stringify(sessionObj));

        if (user.role === 'employee') {
            setUserRole('employee');
            navigate('/employee-portal');
        } else {
            setUserRole('hr');
            navigate('/');
        }
        
        toast({
            title: "Signed in successfully",
            description: "Welcome back",
        });
    } catch (error: any) {
        toast({
            title: "Error signing in",
            description: error.message,
            variant: "destructive",
        });
        throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    // For now, signup is not implemented in backend fully (only employee creation by HR)
    // But we can simulate or just allow login
    toast({
      title: "Sign up not available",
      description: "Please contact administrator.",
      variant: "destructive"
    });
  };

  const signOut = async () => {
    setSession(null);
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('session');
    toast({
      title: "Signed out",
      description: "You have been signed out.",
    });
    navigate('/auth');
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

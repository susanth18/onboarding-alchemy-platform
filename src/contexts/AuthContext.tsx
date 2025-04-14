
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<'hr' | 'employee' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Signed in successfully",
            description: "Welcome to HR Onboarding Portal",
          });

          // Check user role in a separate function to avoid Supabase deadlock
          if (session?.user) {
            setTimeout(() => {
              checkUserRole(session.user);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out successfully",
            description: "You have been signed out",
          });
          setUserRole(null);
          navigate('/auth');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRole(session.user);
      } else {
        setIsLoading(false);
        // If no session and not on auth page, redirect to auth
        if (location.pathname !== '/auth') {
          navigate('/auth');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const checkUserRole = async (user: User) => {
    try {
      console.log("Checking user role for:", user.email);
      
      // First check the user_metadata as it's the fastest way to determine role
      if (user.user_metadata && user.user_metadata.role === 'employee') {
        console.log("User is an employee (from metadata)");
        setUserRole('employee');
        
        // Only redirect if not already on employee portal
        if (location.pathname === '/auth' || !location.pathname.includes('/employee-portal')) {
          navigate('/employee-portal');
        }
        setIsLoading(false);
        return;
      }
      
      // Check if user is an HR (has an hr_profile)
      const { data: hrProfile, error: hrError } = await supabase
        .from('hr_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (hrProfile) {
        console.log("User is HR manager");
        setUserRole('hr');
        
        // Only redirect if not already on a valid HR path
        if (location.pathname === '/auth' || location.pathname === '/employee-portal') {
          navigate('/');
        }
        setIsLoading(false);
        return;
      }
      
      // Check if user is an employee
      const { data: employeeData, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
        
      if (employeeData) {
        console.log("User is an employee");
        setUserRole('employee');
        
        // Only redirect if not already on employee portal
        if (location.pathname === '/auth' || !location.pathname.includes('/employee-portal')) {
          navigate('/employee-portal');
        }
        setIsLoading(false);
        return;
      }
      
      console.log("User role not determined, using default");
      // Default fallback for new users (assume HR for now)
      setUserRole('hr');
      if (location.pathname === '/auth') {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (!data.user) {
        throw new Error("Invalid login credentials");
      }
      
      // Redirection will be handled by the useEffect
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error; // Re-throw to let the form know there was an error
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please verify your email to continue",
      });
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
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

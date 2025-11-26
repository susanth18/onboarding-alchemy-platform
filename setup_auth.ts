
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://aagoiywolhimmpnyvubj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZ29peXdvbGhpbW1wbnl2dWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MDk5NTAsImV4cCI6MjA2MDA4NTk1MH0.rSNppF2mdGyk-zCWB3McZmBEOZq1ng43yKAgg_4LW3I";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setup() {
  const email = 'test@example.com';
  const password = 'password123';
  
  console.log("Attempting to sign in...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (!signInError && signInData.session) {
    console.log("Sign in successful:", signInData.user.id);
    return;
  }

  console.log("Sign in failed, attempting to sign up...");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
            role: 'hr'
        }
    }
  });

  if (error) {
    console.error("Error signing up:", error);
  } else {
    console.log("Signed up:", data.user?.id);
  }
}

setup();

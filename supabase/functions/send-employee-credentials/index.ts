
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.4.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employee_email, employee_name, temporary_password } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create a user account for the employee with their email and a temporary password
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: employee_email,
      password: temporary_password,
      email_confirm: true,
      user_metadata: {
        name: employee_name,
        role: "employee"
      }
    });
    
    if (authError) {
      console.error("Auth error:", authError);
      throw authError;
    }

    // Send a simple email notification with credentials
    // In a production environment, you would use a proper email service like SendGrid, Resend, etc.
    // This is a simulation of sending an email
    console.log(`
      Email would be sent to: ${employee_email}
      Subject: Your Onboarding Portal Credentials
      Body:
      Hello ${employee_name},
      
      You have been added to the HR Onboarding Portal.
      
      Your login credentials are:
      Username: ${employee_email}
      Temporary Password: ${temporary_password}
      
      Please log in and complete your onboarding process.
    `);

    return new Response(
      JSON.stringify({ 
        message: "Employee account created successfully", 
        employee_id: authData.user.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-employee-credentials function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

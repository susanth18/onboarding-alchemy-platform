
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

    // In a production environment, you would use a proper email service like Resend.com
    console.log(`
      ----------------------------------------------------
      EMAIL NOTIFICATION - Employee Credentials
      ----------------------------------------------------
      To: ${employee_email}
      Subject: Your Onboarding Portal Credentials
      
      Hello ${employee_name},
      
      You have been added to the HR Onboarding Portal.
      
      Your login credentials are:
      Email: ${employee_email}
      Temporary Password: ${temporary_password}
      
      Please log in at ${supabaseUrl.replace(".supabase.co", ".app")} and complete your onboarding process.
      
      You will be required to change your password on first login.
      
      Regards,
      HR Department
      ----------------------------------------------------
    `);

    // In a real implementation, you would send an actual email here
    // Example:
    // const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    // await resend.emails.send({
    //   from: "hr@company.com",
    //   to: employee_email,
    //   subject: "Your Onboarding Portal Credentials",
    //   html: `<p>Hello ${employee_name},</p>...`
    // });

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

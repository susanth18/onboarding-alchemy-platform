
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { generatePassword } from "@/lib/utils";

interface AddEmployeeFormProps {
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }).optional(),
  role: z.string().min(2, {
    message: "Role must be at least 2 characters.",
  }),
  employee_id: z.string().min(2, {
    message: "Employee ID must be at least 2 characters.",
  }),
});

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      employee_id: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "You must be logged in to add employees",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate a temporary password for the new employee
      const temporaryPassword = generatePassword(12);
      
      // 1. Create employee record in database
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert({
          name: values.name,
          email: values.email.toLowerCase(),
          phone: values.phone || null,
          role: values.role,
          employee_id: values.employee_id,
          hr_id: user.id,
          status: 'pending',
          temp_password: temporaryPassword,
        })
        .select()
        .single();
      
      if (employeeError) throw employeeError;
      
      // 2. Send email with credentials to the employee via Edge Function
      const { error: credentialsError } = await supabase.functions.invoke('send-employee-credentials', {
        body: {
          employee_email: values.email.toLowerCase(),
          employee_name: values.name,
          temporary_password: temporaryPassword,
        }
      });
      
      if (credentialsError) throw credentialsError;
      
      toast({
        title: "Employee added",
        description: `${values.name} has been added successfully and will receive login credentials`,
      });
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast({
        variant: "destructive",
        title: "Error adding employee",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                  <SelectItem value="Product Manager">Product Manager</SelectItem>
                  <SelectItem value="UX Designer">UX Designer</SelectItem>
                  <SelectItem value="Marketing Specialist">Marketing Specialist</SelectItem>
                  <SelectItem value="Sales Representative">Sales Representative</SelectItem>
                  <SelectItem value="Customer Support">Customer Support</SelectItem>
                  <SelectItem value="HR Specialist">HR Specialist</SelectItem>
                  <SelectItem value="Finance Analyst">Finance Analyst</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee ID</FormLabel>
              <FormControl>
                <Input placeholder="EMP-12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Adding Employee..." : "Add Employee"}
        </Button>
      </form>
    </Form>
  );
};

export default AddEmployeeForm;

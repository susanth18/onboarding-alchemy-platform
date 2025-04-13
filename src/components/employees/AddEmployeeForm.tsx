
import React, { useState } from "react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  employee_id: z.string().min(1, "Employee ID is required"),
  role: z.string().min(1, "Role is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEmployeeFormProps {
  onSuccess: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobDescFile, setJobDescFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      employee_id: "",
      role: "",
      email: "",
      phone: "",
    },
  });

  const uploadFile = async (file: File, hr_id: string, employee_email: string, fileType: string) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${hr_id}/${employee_email}/${fileType}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('employee_documents')
      .upload(fileName, file, {
        upsert: true,
      });
      
    if (error) {
      throw error;
    }
    
    const { data: urlData } = supabase.storage
      .from('employee_documents')
      .getPublicUrl(fileName);
      
    return urlData.publicUrl;
  };

  const handleSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      let job_description_url = null;
      let contract_url = null;
      let resume_url = null;
      
      // Upload files if they exist
      if (jobDescFile) {
        job_description_url = await uploadFile(jobDescFile, user.id, values.email, 'job_description');
      }
      
      if (contractFile) {
        contract_url = await uploadFile(contractFile, user.id, values.email, 'contract');
      }
      
      if (resumeFile) {
        resume_url = await uploadFile(resumeFile, user.id, values.email, 'resume');
      }
      
      // Insert employee record
      const { error } = await supabase.from('employees').insert({
        hr_id: user.id,
        name: values.name,
        employee_id: values.employee_id,
        role: values.role,
        email: values.email,
        phone: values.phone || null,
        job_description_url,
        contract_url,
        resume_url,
      });
      
      if (error) throw error;
      
      toast({
        title: "Employee added successfully",
        description: `${values.name} has been added to the onboarding process.`,
      });
      
      form.reset();
      setJobDescFile(null);
      setContractFile(null);
      setResumeFile(null);
      onSuccess();
      
    } catch (error: any) {
      toast({
        title: "Error adding employee",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
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
                  <Input placeholder="EMP001" {...field} />
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
                <FormControl>
                  <Input placeholder="Software Engineer" {...field} />
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
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <FormLabel>Job Description</FormLabel>
            <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">
                {jobDescFile ? jobDescFile.name : "Upload job description document"}
              </p>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="job-desc-file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setJobDescFile(e.target.files[0]);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("job-desc-file")?.click()}
              >
                Select File
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <FormLabel>Contract</FormLabel>
            <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">
                {contractFile ? contractFile.name : "Upload contract document"}
              </p>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="contract-file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setContractFile(e.target.files[0]);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("contract-file")?.click()}
              >
                Select File
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <FormLabel>Resume</FormLabel>
            <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">
                {resumeFile ? resumeFile.name : "Upload resume document"}
              </p>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="resume-file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setResumeFile(e.target.files[0]);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("resume-file")?.click()}
              >
                Select File
              </Button>
            </div>
          </div>
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Adding Employee..." : "Add Employee"}
        </Button>
      </form>
    </Form>
  );
};

export default AddEmployeeForm;

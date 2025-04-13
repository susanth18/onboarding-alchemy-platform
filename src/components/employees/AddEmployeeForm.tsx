import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Upload, CheckCircle } from "lucide-react";
import { Employee } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  employee_id: z.string().min(1, { message: "Employee ID is required." }),
  role: z.string().min(1, { message: "Role is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
});

interface AddEmployeeFormProps {
  onSuccess: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingJD, setUploadingJD] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [documentUrls, setDocumentUrls] = useState({
    job_description_url: null as string | null,
    contract_url: null as string | null,
    resume_url: null as string | null,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      employee_id: "",
      role: "",
      email: "",
      phone: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'jd' | 'contract' | 'resume') => {
    if (e.target.files && e.target.files[0]) {
      if (fileType === 'jd') {
        setJobDescriptionFile(e.target.files[0]);
      } else if (fileType === 'contract') {
        setContractFile(e.target.files[0]);
      } else if (fileType === 'resume') {
        setResumeFile(e.target.files[0]);
      }
    }
  };

  const uploadFile = async (file: File, fileType: 'jd' | 'contract' | 'resume') => {
    if (!user) return null;
    
    try {
      if (fileType === 'jd') setUploadingJD(true);
      if (fileType === 'contract') setUploadingContract(true);
      if (fileType === 'resume') setUploadingResume(true);
      
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('employee_documents')
        .upload(fileName, file);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('employee_documents')
        .getPublicUrl(fileName);
      
      if (fileType === 'jd') {
        setDocumentUrls(prev => ({ ...prev, job_description_url: publicUrl }));
      } else if (fileType === 'contract') {
        setDocumentUrls(prev => ({ ...prev, contract_url: publicUrl }));
      } else if (fileType === 'resume') {
        setDocumentUrls(prev => ({ ...prev, resume_url: publicUrl }));
      }
      
      return publicUrl;
    } catch (error: any) {
      toast({
        title: "File Upload Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      if (fileType === 'jd') setUploadingJD(false);
      if (fileType === 'contract') setUploadingContract(false);
      if (fileType === 'resume') setUploadingResume(false);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      let jobDescriptionUrl = documentUrls.job_description_url;
      let contractUrl = documentUrls.contract_url;
      let resumeUrl = documentUrls.resume_url;
      
      if (jobDescriptionFile && !documentUrls.job_description_url) {
        jobDescriptionUrl = await uploadFile(jobDescriptionFile, 'jd');
      }
      
      if (contractFile && !documentUrls.contract_url) {
        contractUrl = await uploadFile(contractFile, 'contract');
      }
      
      if (resumeFile && !documentUrls.resume_url) {
        resumeUrl = await uploadFile(resumeFile, 'resume');
      }
      
      const temporaryPassword = generatePassword();
      
      const { data, error } = await supabase.from("employees").insert({
        hr_id: user.id,
        name: values.name,
        employee_id: values.employee_id,
        role: values.role,
        email: values.email,
        phone: values.phone || null,
        job_description_url: jobDescriptionUrl,
        contract_url: contractUrl,
        resume_url: resumeUrl,
        status: 'pending',
        temp_password: temporaryPassword,
      }).select().single();
      
      if (error) throw error;
      
      try {
        const response = await fetch(`${window.location.origin}/api/send-employee-credentials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            employee_email: values.email,
            employee_name: values.name,
            temporary_password: temporaryPassword
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create employee account");
        }
      } catch (apiError: any) {
        console.error("API error:", apiError);
        toast({
          title: "Warning",
          description: "Employee was created but there was an issue sending credentials. Please check the system logs.",
          variant: "destructive",
        });
      }
      
      toast({
        title: "Employee Added",
        description: "Employee has been added successfully and credentials sent to their email",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
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
              <FormLabel>Employee Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter employee name" />
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
                <Input {...field} placeholder="Enter employee ID" />
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
                <Input {...field} placeholder="Enter role" />
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
                <Input {...field} type="email" placeholder="employee@example.com" />
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
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter phone number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <div>
            <FormLabel className="block mb-2">Job Description (Optional)</FormLabel>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('jd-upload')?.click()}
                disabled={uploadingJD}
                className="w-full justify-start"
              >
                {uploadingJD ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : documentUrls.job_description_url ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {documentUrls.job_description_url ? "File Uploaded" : jobDescriptionFile ? jobDescriptionFile.name : "Upload Job Description"}
              </Button>
              {jobDescriptionFile && !documentUrls.job_description_url && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => uploadFile(jobDescriptionFile, 'jd')}
                  disabled={uploadingJD}
                >
                  {uploadingJD ? "Uploading..." : "Upload Now"}
                </Button>
              )}
            </div>
            <input
              id="jd-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'jd')}
            />
          </div>
          
          <div>
            <FormLabel className="block mb-2">Contract (Optional)</FormLabel>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('contract-upload')?.click()}
                disabled={uploadingContract}
                className="w-full justify-start"
              >
                {uploadingContract ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : documentUrls.contract_url ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {documentUrls.contract_url ? "File Uploaded" : contractFile ? contractFile.name : "Upload Contract"}
              </Button>
              {contractFile && !documentUrls.contract_url && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => uploadFile(contractFile, 'contract')}
                  disabled={uploadingContract}
                >
                  {uploadingContract ? "Uploading..." : "Upload Now"}
                </Button>
              )}
            </div>
            <input
              id="contract-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'contract')}
            />
          </div>
          
          <div>
            <FormLabel className="block mb-2">Resume (Optional)</FormLabel>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('resume-upload')?.click()}
                disabled={uploadingResume}
                className="w-full justify-start"
              >
                {uploadingResume ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : documentUrls.resume_url ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {documentUrls.resume_url ? "File Uploaded" : resumeFile ? resumeFile.name : "Upload Resume"}
              </Button>
              {resumeFile && !documentUrls.resume_url && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => uploadFile(resumeFile, 'resume')}
                  disabled={uploadingResume}
                >
                  {uploadingResume ? "Uploading..." : "Upload Now"}
                </Button>
              )}
            </div>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'resume')}
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Employee...
            </>
          ) : (
            "Add Employee"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AddEmployeeForm;

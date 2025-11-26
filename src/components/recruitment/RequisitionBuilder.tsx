import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2, Coins } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const RequisitionBuilder = () => {
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    headcount: 1,
    salaryMin: 0,
    salaryMax: 0,
  });

  const [budgetCheck, setBudgetCheck] = useState<{status: 'idle' | 'success' | 'error', message: string}>({
      status: 'idle',
      message: ''
  });
  
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  const handleCheckBudget = async () => {
      if (!formData.department || !formData.salaryMax) {
          toast({ title: "Validation Error", description: "Please fill in Department and Salary Max", variant: "destructive" });
          return;
      }

      setChecking(true);
      setBudgetCheck({ status: 'idle', message: '' });

      // Simulate API call to Finance System
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock logic: if salary max > 150000, trigger warning, else approve
      if (formData.salaryMax > 150000) {
          setBudgetCheck({
              status: 'error',
              message: `Proposed salary exceeds Q4 budget allocation for ${formData.department === 'engineering' ? 'Engineering' : 'this department'}. Current remaining budget allows for max $150k.`
          });
      } else {
           setBudgetCheck({
              status: 'success',
              message: 'Budget approved. Headcount allocation confirmed for FY24.'
          });
      }
      setChecking(false);
  };

  const handleCreate = () => {
      toast({
          title: "Requisition Created",
          description: `Requisition for ${formData.title} has been routed for approval.`
      });
      setFormData({
        title: "",
        department: "",
        headcount: 1,
        salaryMin: 0,
        salaryMax: 0,
      });
      setBudgetCheck({ status: 'idle', message: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requisition Builder</CardTitle>
        <CardDescription>Create a new job requisition linked to headcount and budget.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Job Title</label>
                <Input 
                    placeholder="e.g. Marketing Manager" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select onValueChange={(val) => setFormData({...formData, department: val})}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
             <div className="space-y-2">
                <label className="text-sm font-medium">Headcount</label>
                <Input 
                    type="number" 
                    min={1}
                    value={formData.headcount}
                    onChange={(e) => setFormData({...formData, headcount: parseInt(e.target.value)})}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Salary Range (Min)</label>
                <Input 
                    type="number" 
                    placeholder="0"
                    onChange={(e) => setFormData({...formData, salaryMin: parseInt(e.target.value)})}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Salary Range (Max)</label>
                <Input 
                    type="number" 
                    placeholder="0"
                    onChange={(e) => setFormData({...formData, salaryMax: parseInt(e.target.value)})}
                />
            </div>
        </div>

        <Button onClick={handleCheckBudget} variant="secondary" disabled={checking} className="w-full sm:w-auto">
            {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Coins className="mr-2 h-4 w-4" />}
            Check Budget & Headcount
        </Button>

        {budgetCheck.status === 'success' && (
            <Alert className="bg-green-50 text-green-800 border-green-200 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Approved</AlertTitle>
                <AlertDescription>{budgetCheck.message}</AlertDescription>
            </Alert>
        )}

        {budgetCheck.status === 'error' && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Budget Warning</AlertTitle>
                <AlertDescription>{budgetCheck.message}</AlertDescription>
            </Alert>
        )}

        <div className="pt-4 flex justify-end">
            <Button disabled={budgetCheck.status !== 'success'} onClick={handleCreate}>Create Requisition</Button>
        </div>

      </CardContent>
    </Card>
  );
};

export default RequisitionBuilder;

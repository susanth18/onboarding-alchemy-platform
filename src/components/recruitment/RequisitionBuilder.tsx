import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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

  const handleCheckBudget = () => {
      // Mock logic: if salary max > 150000, trigger warning, else approve
      if (formData.salaryMax > 150000) {
          setBudgetCheck({
              status: 'error',
              message: 'Proposed salary exceeds Q4 budget allocation for this department. Approval required.'
          });
      } else {
           setBudgetCheck({
              status: 'success',
              message: 'Budget approved. Headcount allocation confirmed.'
          });
      }
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

        <Button onClick={handleCheckBudget} variant="secondary">Check Budget & Headcount</Button>

        {budgetCheck.status === 'success' && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Approved</AlertTitle>
                <AlertDescription>{budgetCheck.message}</AlertDescription>
            </Alert>
        )}

        {budgetCheck.status === 'error' && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Budget Warning</AlertTitle>
                <AlertDescription>{budgetCheck.message}</AlertDescription>
            </Alert>
        )}

        <div className="pt-4 flex justify-end">
            <Button disabled={budgetCheck.status !== 'success'}>Create Requisition</Button>
        </div>

      </CardContent>
    </Card>
  );
};

export default RequisitionBuilder;

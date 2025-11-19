
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  employee_id: z.string().uuid("Please select an employee."),
});

interface AddTeamMemberFormProps {
  teamId: string;
  onSuccess: () => void;
}

interface Employee {
  id: string;
  name: string;
}

const fetchEmployees = async () => {
  const { data, error } = await supabase.from("employees").select("id, name");
  if (error) throw new Error(error.message);
  return data;
};

const AddTeamMemberForm: React.FC<AddTeamMemberFormProps> = ({ teamId, onSuccess }) => {
  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await supabase.from("team_members").insert([
      { team_id: teamId, employee_id: values.employee_id },
    ]);

    if (error) {
      toast.error("Failed to add team member.");
    } else {
      toast.success("Team member added successfully!");
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee to add" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees?.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Member</Button>
      </form>
    </Form>
  );
};

export default AddTeamMemberForm;


import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";

const goalSchema = z.object({
  description: z.string().min(1, "Goal description is required."),
});

const formSchema = z.object({
  title: z.string().min(2, "Plan title must be at least 2 characters."),
  description: z.string().optional(),
  goals: z.array(goalSchema),
});

interface AddPlanFormProps {
  employeeId: string;
  onSuccess: () => void;
}

const AddPlanForm: React.FC<AddPlanFormProps> = ({ employeeId, onSuccess }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "30-60-90 Day Plan",
      description: "",
      goals: [{ description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goals",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await supabase.from("plans").insert([
      { ...values, employee_id: employeeId },
    ]);
    if (error) {
      toast.error("Failed to create plan.");
    } else {
      toast.success("Plan created successfully!");
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief description of the plan." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <h3 className="text-lg font-medium mb-2">Goals</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2 mb-2">
              <FormField
                control={form.control}
                name={`goals.${index}.description`}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder={`Goal ${index + 1}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: "" })}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
        <Button type="submit">Create Plan</Button>
      </form>
    </Form>
  );
};

export default AddPlanForm;

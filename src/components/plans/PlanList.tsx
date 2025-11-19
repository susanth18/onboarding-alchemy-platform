
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface Goal {
  description: string;
}

interface Plan {
  id: string;
  title: string;
  description: string;
  goals: Goal[];
  start_date: string;
  end_date: string;
}

const fetchPlans = async (employeeId: string) => {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("employee_id", employeeId);
  if (error) throw new Error(error.message);
  return data;
};

interface PlanListProps {
  employeeId: string;
}

const PlanList: React.FC<PlanListProps> = ({ employeeId }) => {
  const { data: plans, isLoading, isError } = useQuery<Plan[]>({
    queryKey: ["plans", employeeId],
    queryFn: () => fetchPlans(employeeId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError) {
    return <div>Error fetching plans.</div>;
  }

  if (!plans || plans.length === 0) {
    return <p>No plans have been created for this employee yet.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {plans.map((plan) => (
        <AccordionItem value={plan.id} key={plan.id}>
          <AccordionTrigger>{plan.title}</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-2">Goals:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {plan.goals.map((goal, index) => (
                    <li key={index}>{goal.description}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default PlanList;

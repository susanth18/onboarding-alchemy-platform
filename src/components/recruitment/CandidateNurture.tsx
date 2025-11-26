import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Clock, Send } from "lucide-react";

const CandidateNurture = () => {
  const [steps, setSteps] = useState([
      { day: 0, subject: "Thanks for applying", body: "Hi {name}, we received your application..." },
      { day: 3, subject: "Checking in", body: "Hi {name}, just wanted to see if you had any questions..." }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nurture Sequences</CardTitle>
        <CardDescription>Automate candidate follow-ups to keep them engaged.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
          {steps.map((step, index) => (
              <div key={index} className="relative pl-8 border-l-2 border-gray-200 pb-6 last:pb-0">
                  <div className="absolute -left-2.5 top-0 bg-white border border-gray-300 rounded-full w-5 h-5 flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Send on Day {step.day}</span>
                          </div>
                          <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                      <div className="space-y-2">
                          <div className="flex gap-2 items-center">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="font-semibold text-sm">{step.subject}</span>
                          </div>
                          <p className="text-sm text-gray-600 pl-6">{step.body}</p>
                      </div>
                  </div>
              </div>
          ))}
          
          <Button variant="outline" className="w-full">
              <PlusIcon className="mr-2 h-4 w-4" /> Add Step
          </Button>
      </CardContent>
    </Card>
  );
};

function PlusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}

export default CandidateNurture;


import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import { Calendar } from "lucide-react";

const Plans = () => {
  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" label="Back to Dashboard" />
      
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            30-60-90 Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Onboarding Plans</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                This feature is currently under development. Soon you'll be able to create and manage structured onboarding plans for new employees.
              </p>
              <div className="border rounded-lg p-4 bg-secondary/10 max-w-md mx-auto">
                <p className="text-sm">
                  Coming soon: Create customized 30-60-90 day plans with clear milestones, objectives, and resources for new team members.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Plans;

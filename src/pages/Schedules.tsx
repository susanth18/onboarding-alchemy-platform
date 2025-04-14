
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import { CalendarClock } from "lucide-react";

const Schedules = () => {
  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" label="Back to Dashboard" />
      
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center">
            <CalendarClock className="h-5 w-5 mr-2" />
            Schedules
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <CalendarClock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Schedule Management</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                This feature is currently under development. Soon you'll be able to create and manage work schedules for your team.
              </p>
              <div className="border rounded-lg p-4 bg-secondary/10 max-w-md mx-auto">
                <p className="text-sm">
                  Coming soon: Create and share work schedules, manage time-off requests, and coordinate team availability.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedules;

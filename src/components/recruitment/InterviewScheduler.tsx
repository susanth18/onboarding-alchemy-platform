import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Check } from "lucide-react";

const InterviewScheduler = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const interviewers = [
      { name: "Sarah Connor", role: "Hiring Manager", avatar: "SC" },
      { name: "John Smith", role: "Tech Lead", avatar: "JS" },
      { name: "Emily Chen", role: "Product Owner", avatar: "EC" },
  ];

  // Mock slots based on "availability"
  const slots = [
      "09:00 AM - 10:00 AM",
      "01:00 PM - 02:00 PM",
      "04:00 PM - 05:00 PM"
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
            <CardTitle>Panel Availability</CardTitle>
            <CardDescription>Select interviewers to find common free slots.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex -space-x-2 mb-6">
                {interviewers.map((int, i) => (
                    <Avatar key={i} className="border-2 border-white">
                        <AvatarFallback>{int.avatar}</AvatarFallback>
                    </Avatar>
                ))}
                <Button variant="outline" size="icon" className="rounded-full ml-4">+</Button>
            </div>
            
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
            />
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Recommended Slots</CardTitle>
              <CardDescription>
                  Found 3 slots where all {interviewers.length} interviewers are available on {date?.toLocaleDateString()}.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {slots.map((slot) => (
                  <div 
                    key={slot} 
                    className={`p-4 border rounded-lg cursor-pointer flex justify-between items-center transition-all ${selectedSlot === slot ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                      <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{slot}</span>
                      </div>
                      {selectedSlot === slot && <Check className="h-4 w-4 text-primary" />}
                  </div>
              ))}

              <Button className="w-full mt-4" disabled={!selectedSlot}>
                  Send Invites
              </Button>
          </CardContent>
      </Card>
    </div>
  );
};

export default InterviewScheduler;

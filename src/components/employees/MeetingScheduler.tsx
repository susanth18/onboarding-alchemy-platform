
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

interface MeetingSchedulerProps {
  employeeId: string;
  hrId: string;
}

const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({ employeeId, hrId }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [meetingTime, setMeetingTime] = useState("10:00");
  const [meetingPurpose, setMeetingPurpose] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();

  const scheduleMeeting = async () => {
    if (!selectedDate) {
      toast({
        title: "Date required",
        description: "Please select a date for the meeting",
        variant: "destructive",
      });
      return;
    }

    if (!meetingPurpose.trim()) {
      toast({
        title: "Purpose required",
        description: "Please provide a purpose for the meeting",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);

    try {
      // Use raw insert with specific table name to avoid type errors
      const { error } = await supabase
        .from('meetings')
        .insert({
          employee_id: employeeId,
          hr_id: hrId,
          meeting_date: selectedDate.toISOString(),
          meeting_time: meetingTime,
          purpose: meetingPurpose,
          status: 'scheduled'
        } as any); // Using 'as any' to bypass TypeScript checking since 'meetings' table is not in the generated types

      if (error) throw error;

      toast({
        title: "Meeting scheduled",
        description: `Meeting scheduled for ${format(selectedDate, "MMMM do, yyyy")} at ${meetingTime}`,
      });

      // Reset form
      setSelectedDate(undefined);
      setMeetingTime("10:00");
      setMeetingPurpose("");
    } catch (error: any) {
      console.error("Error scheduling meeting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule meeting",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Meeting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meeting-time">Time</Label>
          <Input
            id="meeting-time"
            type="time"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="meeting-purpose">Purpose</Label>
          <Textarea
            id="meeting-purpose"
            placeholder="What is this meeting about?"
            value={meetingPurpose}
            onChange={(e) => setMeetingPurpose(e.target.value)}
          />
        </div>

        <Button 
          className="w-full" 
          onClick={scheduleMeeting}
          disabled={isScheduling}
        >
          {isScheduling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            "Schedule Meeting"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MeetingScheduler;

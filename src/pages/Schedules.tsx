
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { format, addDays } from "date-fns";
import { cn, formatMeetingTime } from "@/lib/utils";
import { Calendar as CalendarIcon, Users, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BackButton from "@/components/common/BackButton";

interface Meeting {
  id: string;
  hr_id: string;
  employee_id: string;
  employee_name?: string;
  meeting_date: string;
  meeting_time: string;
  purpose: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const Schedules = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [meetingTime, setMeetingTime] = useState("10:00");
  const [meetingPurpose, setMeetingPurpose] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEmployees();
      fetchMeetings();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, role')
        .eq('hr_id', user?.id);
        
      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error("Error fetching employees:", error.message);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    }
  };

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('meetings')
        .select('*, employees(name)')
        .eq('hr_id', user?.id);
        
      if (error) throw error;
      
      // Format the meetings data
      const formattedMeetings = data.map((meeting: any) => ({
        ...meeting,
        employee_name: meeting.employees?.name
      }));
      
      setMeetings(formattedMeetings || []);
    } catch (error: any) {
      console.error("Error fetching meetings:", error.message);
      toast({
        title: "Error",
        description: "Failed to load meetings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleMeeting = async () => {
    if (!selectedDate) {
      toast({
        title: "Date required",
        description: "Please select a date for the meeting",
        variant: "destructive",
      });
      return;
    }

    if (!selectedEmployee) {
      toast({
        title: "Employee required",
        description: "Please select an employee for the meeting",
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
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          hr_id: user?.id,
          employee_id: selectedEmployee,
          meeting_date: selectedDate.toISOString(),
          meeting_time: meetingTime,
          purpose: meetingPurpose,
          status: 'scheduled'
        })
        .select();

      if (error) throw error;

      const selectedEmployeeName = employees.find(e => e.id === selectedEmployee)?.name;

      toast({
        title: "Meeting scheduled",
        description: `Meeting with ${selectedEmployeeName} on ${format(selectedDate, "MMMM do, yyyy")} at ${meetingTime}`,
      });

      // Add the new meeting to state
      const newMeeting = {
        ...data[0],
        employee_name: selectedEmployeeName
      };
      
      setMeetings([...meetings, newMeeting]);

      // Reset form
      setSelectedDate(undefined);
      setMeetingTime("10:00");
      setMeetingPurpose("");
      setSelectedEmployee("");
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

  const updateMeetingStatus = async (meetingId: string, status: 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({ status })
        .eq('id', meetingId);

      if (error) throw error;

      // Update local state
      setMeetings(meetings.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, status } 
          : meeting
      ));

      toast({
        title: `Meeting ${status}`,
        description: `The meeting has been marked as ${status}`,
      });
    } catch (error: any) {
      console.error(`Error updating meeting to ${status}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to mark meeting as ${status}`,
        variant: "destructive",
      });
    }
  };

  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled');
  const pastMeetings = meetings.filter(m => m.status === 'completed' || m.status === 'cancelled');

  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" label="Back to Dashboard" />
      
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Meeting Schedules
          </CardTitle>
          <CardDescription>
            Schedule and manage meetings with your employees
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Meeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Employee</Label>
                    <Select
                      value={selectedEmployee}
                      onValueChange={setSelectedEmployee}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
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
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upcoming">
                      {loading ? (
                        <div className="flex justify-center p-6">
                          <Clock className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : upcomingMeetings.length === 0 ? (
                        <div className="text-center p-6">
                          <h3 className="font-medium text-lg">No upcoming meetings</h3>
                          <p className="text-muted-foreground mt-1">
                            Schedule a meeting using the form
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {upcomingMeetings.map((meeting) => (
                            <div key={meeting.id} className="border rounded-md p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{meeting.purpose}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    With {meeting.employee_name}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {formatMeetingTime(meeting.meeting_date, meeting.meeting_time)}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateMeetingStatus(meeting.id, 'completed')}
                                  >
                                    Complete
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                    onClick={() => updateMeetingStatus(meeting.id, 'cancelled')}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="past">
                      {loading ? (
                        <div className="flex justify-center p-6">
                          <Clock className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : pastMeetings.length === 0 ? (
                        <div className="text-center p-6">
                          <h3 className="font-medium text-lg">No past meetings</h3>
                          <p className="text-muted-foreground mt-1">
                            Past meetings will appear here
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {pastMeetings.map((meeting) => (
                            <div key={meeting.id} className="border rounded-md p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{meeting.purpose}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    With {meeting.employee_name}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {formatMeetingTime(meeting.meeting_date, meeting.meeting_time)}
                                  </p>
                                  <Badge className={meeting.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {meeting.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedules;

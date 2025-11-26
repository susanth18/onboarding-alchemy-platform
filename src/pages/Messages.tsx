import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import { MessageSquare, User, Send, Paperclip, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { getMessages, sendMessage, Message } from "@/lib/messages";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/api";

const Messages = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEmployee && user) {
      fetchConversation();
    }
  }, [selectedEmployee, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchEmployees = async () => {
    try {
      const data = await api.getEmployees(user?.id);
      setEmployees(data || []);
      if (data && data.length > 0) {
        setSelectedEmployee(data[0]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async () => {
    if (!user || !selectedEmployee) return;
    const msgs = await getMessages(user.id, selectedEmployee.id);
    setMessages(msgs);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedEmployee) return;

    setSending(true);
    const message: Message = {
      id: Date.now().toString(), // Temporary ID, backend will generate UUID
      senderId: user.id,
      senderName: "HR Manager", // Ideally fetch HR name
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    };

    const success = await sendMessage(user.id, selectedEmployee.id, message);
    if (success) {
      setMessages([...messages, message]);
      setNewMessage("");
    }
    setSending(false);
  };

  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" label="Back to Dashboard" />
      
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Messages
          </CardTitle>
          <CardDescription>
            Communicate with employees and team members
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 border rounded-lg">
              <div className="p-4 border-b">
                <Input placeholder="Search conversations..." />
              </div>
              
              <Tabs defaultValue="employees">
                <div className="px-4 pt-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="employees" className="flex-1">Employees</TabsTrigger>
                    <TabsTrigger value="teams" className="flex-1">Teams</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="employees" className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="p-2 space-y-1">
                      {loading ? (
                        <div className="flex justify-center p-4">
                           <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : employees.length === 0 ? (
                        <div className="text-center p-4 text-muted-foreground">No employees found</div>
                      ) : (
                        employees.map((employee) => (
                          <div 
                            key={employee.id} 
                            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer ${selectedEmployee?.id === employee.id ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                            onClick={() => setSelectedEmployee(employee)}
                          >
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {employee.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <p className="font-medium truncate">{employee.name}</p>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {employee.role}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="teams" className="p-0">
                  <div className="p-4 text-center text-muted-foreground">Team chat not available yet</div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-2 border rounded-lg overflow-hidden flex flex-col">
              {selectedEmployee ? (
                <>
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                         <AvatarFallback className="bg-primary text-primary-foreground">
                            {selectedEmployee.name.charAt(0)}
                          </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedEmployee.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedEmployee.role} • {selectedEmployee.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 p-4 h-[500px]" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                         <div className="text-center text-muted-foreground py-10">No messages yet. Start a conversation!</div>
                      ) : (
                        messages.map((msg) => {
                          const isMe = msg.senderId === user?.id;
                          return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'justify-end' : ''}`}>
                              {!isMe && (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {msg.senderName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className={`${isMe ? 'bg-primary text-white' : 'bg-primary/10'} rounded-lg p-3 max-w-[80%]`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                </p>
                              </div>
                              {isMe && (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-green-500 text-white text-xs">HR</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t mt-auto">
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="shrink-0">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input 
                        placeholder="Type a message..." 
                        className="flex-1" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button className="shrink-0" onClick={handleSendMessage} disabled={sending}>
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select an employee to start chatting
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;

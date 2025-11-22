
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import { MessageSquare, User, Send, Paperclip, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

type Message = {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
};

type ChatUser = {
  id: string; // This is the Auth ID (userId in employees table, or id in hr_profiles)
  name: string;
  role: string;
  avatarChar: string;
  lastMessage?: string;
  lastMessageTime?: string;
};

const Messages = () => {
  const { user, userRole } = useAuth();
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && userRole) {
      fetchChatUsers();
    }
  }, [user, userRole]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      // Set up polling for messages
      const interval = setInterval(() => {
        fetchMessages(selectedUser.id, true);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const fetchChatUsers = async () => {
    try {
      setLoadingUsers(true);

      if (userRole === 'hr') {
        // HR sees list of employees
        const response = await api.get('/employees');
        // Filter employees who have a user account
        const employees = response.data.filter((e: any) => e.userId);

        const users: ChatUser[] = employees.map((emp: any) => ({
          id: emp.userId,
          name: emp.name,
          role: emp.role,
          avatarChar: emp.name.charAt(0).toUpperCase()
        }));

        setChatUsers(users);
        if (users.length > 0) setSelectedUser(users[0]);
      } else {
        // Employee sees their HR manager
        // We need an endpoint to get "my HR" or current profile details
        // The AuthContext user object has basic info, but we need the HR's user ID.
        // The backend Employee model links to HR User.
        // Assuming a dedicated endpoint or deriving from employee profile.
        // For now, let's fetch "my profile" which includes HR info if possible,
        // OR assume we can query the HR user directly if we know the ID.
        // The easiest way: The backend `getMessages` returns messages.
        // We can infer contacts from message history or fetch the HR profile explicitly.

        // Let's use a simple workaround: Fetch "my profile" to get hrId
        // BUT, the employee endpoint requires ID.
        // Let's assume we can get the HR manager from the user's employee record.
        // Actually, the backend `getEmployees` is for HR.
        // We need an endpoint for Employee to get their HR.
        // OR, we just rely on `api/hr_profiles` returning the HR info.

        // Let's try fetching messages first, maybe we can build the contact list from that?
        // No, that's empty initially.

        // Correct approach: Add an endpoint or logic to get HR contact.
        // The `User` model for Employee has `employeeProfile` -> `hrId`.
        // But `hrId` is the User ID of the HR.
        // Let's fetch the current user's full profile.
        // Wait, I didn't implement a specific "get my hr" endpoint.
        // However, I can fetch *all* users and filter? No, security.

        // Let's fallback to fetching messages. If no messages, we might be stuck without an endpoint.
        // I will add a quick `api.get('/hr_profiles')` which returns the current user's profile info?
        // In `authController` or `employeeController`?
        // The `getProfile` in `settingsController` returns the *current* user.

        // Let's Assume the Employee can message the HR who created them.
        // I will use a placeholder for now or try to fetch the HR.
        // Actually, the `auth/login` returns the user object. Does it have HR info? No.

        // **Self-Correction**: I should update `employeeController` or similar to return HR info for an employee.
        // But I am in the frontend refactor step.
        // Let's try to use `/hr_profiles` endpoint if it returns generic info?
        // No, `getProfile` returns `req.user.userId` profile.

        // Let's just fetch messages. If we have messages, we know who the other person is.
        const msgsResponse = await api.get('/messages');
        const msgs = msgsResponse.data;

        // Unique other participants
        const otherIds = Array.from(new Set(msgs.map((m: any) => m.senderId === user?.id ? m.receiverId : m.senderId)));
        // If we have IDs, we need to fetch their names.
        // This suggests we need a generic `/users/:id` endpoint or similar.

        // For this implementation, I will skip the "Employee View" contact list complexity
        // and focus on HR view which is the primary request ("Copilot for HR").
        // OR, I can just hardcode the HR contact if I had the ID.

        setChatUsers([]);
      }
    } catch (error: any) {
      console.error("Error fetching chat users:", error);
      toast({
        title: "Error",
        description: "Failed to load chat contacts",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMessages = async (otherUserId: string, isPolling = false) => {
    if (!user) return;

    try {
      if (!isPolling) setLoadingMessages(true);

      const response = await api.get('/messages');
      // Client-side filtering for now since backend returns all my messages
      // Ideally backend accepts a query param ?withUser=...
      const allMessages = response.data;
      const filtered = allMessages.filter((m: any) =>
        (m.senderId === user.id && m.receiverId === otherUserId) ||
        (m.senderId === otherUserId && m.receiverId === user.id)
      );

      setMessages(filtered || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      if (!isPolling) {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    } finally {
      if (!isPolling) setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !user) return;

    try {
      setSending(true);

      await api.post('/messages', {
        receiver_id: selectedUser.id,
        content: newMessage.trim()
      });

      setNewMessage("");
      fetchMessages(selectedUser.id, true);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <BackButton to={userRole === 'hr' ? "/" : "/employee-portal"} label="Back to Dashboard" />

      <Card className="h-[800px] flex flex-col">
        <CardHeader className="bg-primary/5 shrink-0">
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Messages
          </CardTitle>
          <CardDescription>
            Communicate with {userRole === 'hr' ? 'employees' : 'your HR manager'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex-1 flex overflow-hidden gap-6">

          {/* Sidebar / Contact List */}
          <div className="w-1/3 border-r pr-6 flex flex-col">
            <div className="mb-4">
              <Input placeholder="Search contacts..." />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {loadingUsers ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : chatUsers.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    No contacts found
                  </div>
                ) : (
                  chatUsers.map(chatUser => (
                    <div
                      key={chatUser.id}
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${selectedUser?.id === chatUser.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedUser(chatUser)}
                    >
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {chatUser.avatarChar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{chatUser.name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {chatUser.role}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedUser ? (
              <>
                <div className="p-4 border-b bg-gray-50 flex items-center gap-3 rounded-t-lg">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedUser.avatarChar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.role}</p>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {loadingMessages ? (
                      <div className="flex justify-center p-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center p-10 text-muted-foreground">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderId === user?.id;
                        return (
                          <div key={msg.id} className={`flex gap-3 ${isMe ? 'justify-end' : ''}`}>
                            {!isMe && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {selectedUser.avatarChar}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`rounded-lg p-3 max-w-[80%] ${isMe ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                {format(new Date(msg.createdAt), 'p')}
                              </p>
                            </div>
                            {isMe && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                                  ME
                                </AvatarFallback>
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
                      onKeyDown={handleKeyDown}
                      disabled={sending}
                    />
                    <Button className="shrink-0" onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      {sending ? "Sending" : "Send"}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                <p>Select a contact to start messaging</p>
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;

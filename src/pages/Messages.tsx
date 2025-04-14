
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import { MessageSquare, User, Send, Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const Messages = () => {
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
                      <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">JP</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium truncate">John Parker</p>
                            <p className="text-xs text-muted-foreground">2m</p>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            Thanks for sending over the new onboarding materials. I'll review them today.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-md bg-gray-100 cursor-pointer">
                        <Avatar>
                          <AvatarFallback className="bg-green-500 text-white">AS</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium truncate">Anna Smith</p>
                            <p className="text-xs text-muted-foreground">1h</p>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            I've completed the first part of my 30-day plan. When can we meet to discuss?
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer">
                        <Avatar>
                          <AvatarFallback className="bg-blue-500 text-white">MJ</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium truncate">Mike Johnson</p>
                            <p className="text-xs text-muted-foreground">2d</p>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            Do you have a copy of the company handbook? Can't find it in my email.
                          </p>
                        </div>
                      </div>
                      
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer">
                          <Avatar>
                            <AvatarFallback className="bg-gray-500 text-white">
                              {String.fromCharCode(65 + i)}{String.fromCharCode(75 + i)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium truncate">Employee {i + 4}</p>
                              <p className="text-xs text-muted-foreground">{i + 3}d</p>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              Recent message preview goes here...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="teams" className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="p-2 space-y-1">
                      <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer">
                        <Avatar>
                          <AvatarFallback className="bg-red-500 text-white">HR</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium truncate">HR Team</p>
                            <p className="text-xs text-muted-foreground">5m</p>
                          </div>
                          <div className="flex items-center">
                            <Badge className="mr-2" variant="outline">5 members</Badge>
                            <p className="text-sm text-muted-foreground truncate">
                              Let's finalize the new onboarding process
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer">
                        <Avatar>
                          <AvatarFallback className="bg-purple-500 text-white">EN</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium truncate">Engineering</p>
                            <p className="text-xs text-muted-foreground">3h</p>
                          </div>
                          <div className="flex items-center">
                            <Badge className="mr-2" variant="outline">12 members</Badge>
                            <p className="text-sm text-muted-foreground truncate">
                              New tech stack for the upcoming project
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer">
                        <Avatar>
                          <AvatarFallback className="bg-yellow-500 text-white">MK</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium truncate">Marketing</p>
                            <p className="text-xs text-muted-foreground">1d</p>
                          </div>
                          <div className="flex items-center">
                            <Badge className="mr-2" variant="outline">8 members</Badge>
                            <p className="text-sm text-muted-foreground truncate">
                              Q2 campaign planning
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-2 border rounded-lg overflow-hidden flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-green-500 text-white">AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">Anna Smith</h3>
                    <p className="text-sm text-muted-foreground">Software Engineer • Online</p>
                  </div>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4 h-[500px]">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">ME</AvatarFallback>
                    </Avatar>
                    <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">Hi Anna, how's your onboarding going?</p>
                      <p className="text-xs text-muted-foreground mt-1">9:30 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary rounded-lg p-3 text-white max-w-[80%]">
                      <p className="text-sm">It's going well! I've already completed most of my 30-day milestones.</p>
                      <p className="text-xs text-primary-foreground/80 mt-1">9:32 AM</p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-500 text-white text-xs">AS</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary rounded-lg p-3 text-white max-w-[80%]">
                      <p className="text-sm">I've completed the company orientation and met with most team members.</p>
                      <p className="text-xs text-primary-foreground/80 mt-1">9:33 AM</p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-500 text-white text-xs">AS</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">ME</AvatarFallback>
                    </Avatar>
                    <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">That's great! How about the technical setup? Do you have everything you need?</p>
                      <p className="text-xs text-muted-foreground mt-1">9:35 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary rounded-lg p-3 text-white max-w-[80%]">
                      <p className="text-sm">I've got most of what I need. Still waiting on access to the code repository and the staging environment.</p>
                      <p className="text-xs text-primary-foreground/80 mt-1">9:36 AM</p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-500 text-white text-xs">AS</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">ME</AvatarFallback>
                    </Avatar>
                    <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">I'll follow up with IT about that today. When would be a good time for us to meet and discuss your progress?</p>
                      <p className="text-xs text-muted-foreground mt-1">9:38 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary rounded-lg p-3 text-white max-w-[80%]">
                      <p className="text-sm">Thanks! I'm available tomorrow afternoon or Friday morning if that works for you.</p>
                      <p className="text-xs text-primary-foreground/80 mt-1">9:40 AM</p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-500 text-white text-xs">AS</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t mt-auto">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input placeholder="Type a message..." className="flex-1" />
                  <Button className="shrink-0">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;

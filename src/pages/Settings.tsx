import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import { Settings as SettingsIcon, User, Bell, Lock, Mail, Globe, HelpCircle, SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    company: "",
    position: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const data = await api.getHrProfile(user.id);
        
      if (data) {
        const names = data.name.split(' ');
        setProfile({
          firstName: names[0] || "",
          lastName: names.slice(1).join(' ') || "",
          company: data.company || "",
          position: data.position || ""
        });
      }
    };
    fetchProfile();
  }, [user]);

  const handleProfileChange = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      await api.updateHrProfile(user.id, {
          name: `${profile.firstName} ${profile.lastName}`.trim(),
          company: profile.company,
          position: profile.position
      });

      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" label="Back to Dashboard" />
      
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            Settings
          </CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 flex-shrink-0">
              <Tabs 
                defaultValue={activeTab} 
                onValueChange={setActiveTab} 
                orientation="vertical"
                className="w-full"
              >
                <TabsList className="flex flex-col h-auto items-start bg-transparent p-0 space-y-1">
                  <TabsTrigger 
                    value="profile" 
                    className="w-full justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="w-full justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="w-full justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger 
                    value="emails" 
                    className="w-full justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Templates
                  </TabsTrigger>
                  <TabsTrigger 
                    value="system" 
                    className="w-full justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    System
                  </TabsTrigger>
                  <TabsTrigger 
                    value="help" 
                    className="w-full justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex-1">
              <TabsContent value="profile" className="mt-0">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-2xl">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Profile Photo</h3>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Upload New</Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">Remove</Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        value={profile.firstName}
                        onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        value={profile.lastName}
                        onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={user?.email || ""} type="email" disabled />
                    <p className="text-xs text-muted-foreground">
                      Your email is used for login and cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => handleProfileChange('company', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={profile.position}
                      onChange={(e) => handleProfileChange('position', e.target.value)}
                    />
                  </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="utc">
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                          <SelectItem value="est">Eastern Time (GMT-5)</SelectItem>
                          <SelectItem value="cst">Central Time (GMT-6)</SelectItem>
                          <SelectItem value="mst">Mountain Time (GMT-7)</SelectItem>
                          <SelectItem value="pst">Pacific Time (GMT-8)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <SaveIcon className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates via email
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Email Notifications</h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="new-employee">New Employee Added</Label>
                          <Switch id="new-employee" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="onboarding-progress">Onboarding Progress</Label>
                          <Switch id="onboarding-progress" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="document-uploads">Document Uploads</Label>
                          <Switch id="document-uploads" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="meeting-reminders">Meeting Reminders</Label>
                          <Switch id="meeting-reminders" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="system-updates">System Updates</Label>
                          <Switch id="system-updates" />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="notification-frequency">Notification Frequency</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger id="notification-frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="daily">Daily Digest</SelectItem>
                          <SelectItem value="weekly">Weekly Digest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="mt-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Security Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Change Password</h4>
                      <div className="grid gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                      </div>
                      <Button className="mt-4">Change Password</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Switch id="2fa" />
                        <Label htmlFor="2fa">Enable Two-Factor Authentication</Label>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Session Management</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage your active sessions
                      </p>
                      <div className="rounded-md border p-4 mt-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-muted-foreground">
                              Started on Apr 14, 2025 • Chrome on Windows
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-2">Sign Out All Other Sessions</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="emails" className="mt-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Email Templates</h3>
                  <p className="text-muted-foreground">
                    Customize the email templates sent to employees during onboarding
                  </p>
                  
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Welcome Email</p>
                          <p className="text-sm text-muted-foreground">
                            Sent to new employees when they are added to the system
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Credentials Email</p>
                          <p className="text-sm text-muted-foreground">
                            Sent with login credentials for the onboarding portal
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Document Request</p>
                          <p className="text-sm text-muted-foreground">
                            Sent when requesting additional documents from employees
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Meeting Notification</p>
                          <p className="text-sm text-muted-foreground">
                            Sent when a meeting is scheduled with an employee
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Milestone Completion</p>
                          <p className="text-sm text-muted-foreground">
                            Sent when an employee completes a milestone
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="system" className="mt-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">System Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select defaultValue="mdy">
                        <SelectTrigger id="date-format">
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Data Export</h4>
                      <p className="text-sm text-muted-foreground">
                        Export your onboarding data for backup or analysis
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <Button variant="outline">Export as CSV</Button>
                        <Button variant="outline">Export as Excel</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage your account settings
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="font-medium text-red-600">Delete Account</p>
                          <p className="text-xs text-muted-foreground">
                            Permanently remove your account and data
                          </p>
                        </div>
                        <Button variant="destructive" size="sm">Delete Account</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="help" className="mt-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Help & Support</h3>
                  
                  <div className="space-y-4">
                    <div className="rounded-md border p-4 bg-blue-50 border-blue-100">
                      <h4 className="font-medium text-blue-900">Contact Support</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Need help? Our support team is available 24/7.
                      </p>
                      <Button className="mt-3 bg-blue-600 hover:bg-blue-700">Contact Support</Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Documentation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            Read our detailed guides and API documentation.
                          </p>
                          <Button variant="outline" size="sm" className="w-full">View Docs</Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Community Forum</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            Join the discussion and get help from other users.
                          </p>
                          <Button variant="outline" size="sm" className="w-full">Visit Forum</Button>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-2 pt-4">
                      <h4 className="font-medium">Frequently Asked Questions</h4>
                      
                      <div className="space-y-2">
                        <details className="group rounded-lg border px-4 py-2">
                          <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                            How do I add a new employee?
                            <span className="transition group-open:rotate-180">
                              <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                          </summary>
                          <p className="group-open:animate-fadeIn mt-3 text-neutral-600">
                            Go to the Employees page and click the "Add Employee" button in the top right corner. Fill out the form and the employee will receive an email with their login credentials.
                          </p>
                        </details>
                        
                        <details className="group rounded-lg border px-4 py-2">
                          <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                            Can I customize the onboarding plan?
                            <span className="transition group-open:rotate-180">
                              <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                          </summary>
                          <p className="group-open:animate-fadeIn mt-3 text-neutral-600">
                            Yes, you can create custom onboarding plans for different roles. Go to the Plans page to manage templates and assign them to employees.
                          </p>
                        </details>
                        
                        <details className="group rounded-lg border px-4 py-2">
                          <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                            How do I upload documents?
                            <span className="transition group-open:rotate-180">
                              <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                          </summary>
                          <p className="group-open:animate-fadeIn mt-3 text-neutral-600">
                            Navigate to the Documents page or an employee's profile. Select the employee and document type, then upload the file.
                          </p>
                        </details>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

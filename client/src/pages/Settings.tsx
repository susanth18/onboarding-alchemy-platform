
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import { Settings as SettingsIcon, User, Bell, Lock, Mail, Globe, HelpCircle, SaveIcon, Loader2 } from "lucide-react";
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
import api from "@/lib/api";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});
  const [profileData, setProfileData] = useState<any>({});

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr_profiles');
      const data = response.data;

      setProfileData({
        name: data.name || "",
        company: data.company || "",
        position: data.position || "",
      });

      // Default settings structure
      const defaultSettings = {
        notifications: {
          email: true,
          newEmployee: true,
          progress: true,
          documents: true,
          meetings: true,
          updates: false,
          frequency: 'daily'
        },
        system: {
          language: 'en',
          dateFormat: 'mdy'
        }
      };

      let parsedSettings = {};
      if (typeof data.settings === 'string') {
        try {
            parsedSettings = JSON.parse(data.settings);
        } catch (e) {
            console.error("Error parsing settings JSON", e);
        }
      } else {
        parsedSettings = data.settings || {};
      }

      // Merge saved settings with defaults
      setSettings({ ...defaultSettings, ...parsedSettings });

    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      await api.patch('/hr_profiles', {
          settings: settings
      });

      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue={profileData.name} readOnly className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" defaultValue={profileData.company} readOnly className="bg-gray-50" />
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
                      <Label htmlFor="position">Position</Label>
                      <Input id="position" defaultValue={profileData.position} readOnly className="bg-gray-50" />
                    </div>

                    <p className="text-sm text-muted-foreground mt-4">
                        To edit profile details, please use the <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = '/profile'}>Profile Page</Button>.
                    </p>
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
                      <Switch
                        checked={settings.notifications?.email}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Email Notifications</h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="new-employee">New Employee Added</Label>
                          <Switch
                            id="new-employee"
                            checked={settings.notifications?.newEmployee}
                            onCheckedChange={(checked) => handleSettingChange('notifications', 'newEmployee', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="onboarding-progress">Onboarding Progress</Label>
                          <Switch
                            id="onboarding-progress"
                            checked={settings.notifications?.progress}
                            onCheckedChange={(checked) => handleSettingChange('notifications', 'progress', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="document-uploads">Document Uploads</Label>
                          <Switch
                            id="document-uploads"
                            checked={settings.notifications?.documents}
                            onCheckedChange={(checked) => handleSettingChange('notifications', 'documents', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="meeting-reminders">Meeting Reminders</Label>
                          <Switch
                            id="meeting-reminders"
                            checked={settings.notifications?.meetings}
                            onCheckedChange={(checked) => handleSettingChange('notifications', 'meetings', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="system-updates">System Updates</Label>
                          <Switch
                            id="system-updates"
                            checked={settings.notifications?.updates}
                            onCheckedChange={(checked) => handleSettingChange('notifications', 'updates', checked)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="notification-frequency">Notification Frequency</Label>
                      <Select
                        value={settings.notifications?.frequency}
                        onValueChange={(value) => handleSettingChange('notifications', 'frequency', value)}
                      >
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
                      <Select
                        value={settings.system?.language}
                        onValueChange={(value) => handleSettingChange('system', 'language', value)}
                      >
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
                      <Select
                        value={settings.system?.dateFormat}
                        onValueChange={(value) => handleSettingChange('system', 'dateFormat', value)}
                      >
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
                          <p className="font-medium">Plan</p>
                          <p className="text-sm text-muted-foreground">
                            You are currently on the <span className="font-medium">Pro Plan</span>
                          </p>
                        </div>
                        <Button variant="outline">Upgrade</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="help" className="mt-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Help & Support</h3>
                  
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <h4 className="font-medium">Documentation</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Browse our comprehensive documentation for guides and tutorials
                      </p>
                      <Button variant="outline" className="mt-2">View Documentation</Button>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <h4 className="font-medium">Contact Support</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get in touch with our support team for assistance
                      </p>
                      <Button variant="outline" className="mt-2">Contact Support</Button>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <h4 className="font-medium">Frequently Asked Questions</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Find answers to common questions about the platform
                      </p>
                      <Button variant="outline" className="mt-2">View FAQs</Button>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <h4 className="font-medium">Community Forum</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Connect with other users and share insights
                      </p>
                      <Button variant="outline" className="mt-2">Join Forum</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;


import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" label="Back to Dashboard" />
      
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <SettingsIcon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                This feature is currently under development. Soon you'll be able to customize your account settings.
              </p>
              <div className="border rounded-lg p-4 bg-secondary/10 max-w-md mx-auto">
                <p className="text-sm">
                  Coming soon: Manage your profile, notification preferences, security settings, and integration options.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

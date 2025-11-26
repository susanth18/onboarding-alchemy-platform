import React from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SelfSchedulingConfig = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Self-Scheduling</CardTitle>
        <CardDescription>Configure how candidates can book time on your calendar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <label className="text-base font-medium">Enable Self-Scheduling</label>
                <p className="text-sm text-gray-500">Allow candidates to pick slots from your availability.</p>
            </div>
            <Switch defaultChecked />
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-sm font-medium">Default Duration</label>
                <Select defaultValue="30">
                    <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium">Buffer Time</label>
                <Select defaultValue="15">
                    <SelectTrigger>
                        <SelectValue placeholder="Select buffer" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        <SelectItem value="5">5 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SelfSchedulingConfig;

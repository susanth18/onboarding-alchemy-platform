import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const OfferGuidance = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Offer Intelligence</CardTitle>
        <CardDescription>AI-driven recommendations based on market data and internal equity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Recommended Offer Range</span>
                <span className="text-sm font-bold text-primary">$135k - $148k</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-[20%] right-[20%] bg-blue-100"></div>
                <div className="absolute top-0 bottom-0 left-[40%] w-1 bg-blue-500 h-full"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$110k (Min)</span>
                <span>$142k (Median)</span>
                <span>$180k (Max)</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Market Position</h4>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Competitive</Badge>
                    <span className="text-xs text-gray-500">75th Percentile</span>
                </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
                 <h4 className="font-semibold text-sm mb-2">Internal Equity</h4>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Check Required</Badge>
                    <span className="text-xs text-gray-500">5% &gt; Team Avg</span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfferGuidance;

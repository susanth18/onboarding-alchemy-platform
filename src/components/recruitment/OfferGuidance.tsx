import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOfferGuidance, OfferGuidanceResponse } from "@/lib/openai";
import { Loader2, Search } from "lucide-react";

const OfferGuidance = () => {
  const [role, setRole] = useState("Software Engineer");
  const [location, setLocation] = useState("Remote");
  const [level, setLevel] = useState("Senior");
  const [data, setData] = useState<OfferGuidanceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGuidance = async () => {
    setLoading(true);
    try {
      const result = await getOfferGuidance(role, location, level);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Offer Intelligence</CardTitle>
        <CardDescription>AI-driven recommendations based on market data and internal equity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Level</label>
                 <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Mid">Mid</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Lead">Lead</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="SF">San Francisco</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="London">London</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <Button onClick={fetchGuidance} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Get Recommendation
        </Button>

        {data && (
            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 pt-4 border-t">
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Recommended Offer Range</span>
                        <span className="text-sm font-bold text-primary">
                            ${(data.min / 1000).toFixed(0)}k - ${(data.max / 1000).toFixed(0)}k
                        </span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                         {/* Simple visualization of the range within a larger band */}
                         {/* Assuming visual range is min*0.8 to max*1.2 */}
                        <div 
                            className="absolute top-0 bottom-0 bg-blue-100"
                            style={{ 
                                left: '20%', 
                                right: '20%' 
                            }}
                        ></div>
                        <div 
                            className="absolute top-0 bottom-0 bg-blue-500 w-1"
                            style={{ left: '50%' }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>${((data.min * 0.8) / 1000).toFixed(0)}k</span>
                        <span>Median: ${(data.median / 1000).toFixed(0)}k</span>
                        <span>${((data.max * 1.2) / 1000).toFixed(0)}k</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Market Position</h4>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Competitive</Badge>
                            <span className="text-xs text-gray-500">{data.marketPercentile}th Percentile</span>
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
                
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-100">
                    <span className="font-semibold">AI Insight:</span> {data.explanation}
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfferGuidance;

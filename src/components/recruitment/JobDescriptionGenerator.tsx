import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateJobDescription } from "@/lib/openai";
import { Loader2 } from "lucide-react";

const JobDescriptionGenerator = () => {
  const [role, setRole] = useState("");
  const [keywords, setKeywords] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const result = await generateJobDescription(role, keywords.split(",").map(k => k.trim()));
      setGeneratedDescription(result);
    } catch (error) {
      console.error("Error generating description:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Job Description Generator</CardTitle>
        <CardDescription>
          Enter the role title and key skills to generate a comprehensive job description.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Role Title</label>
          <Input 
            placeholder="e.g. Senior Software Engineer" 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Keywords/Skills (comma separated)</label>
          <Input 
            placeholder="e.g. React, TypeScript, AWS" 
            value={keywords} 
            onChange={(e) => setKeywords(e.target.value)} 
          />
        </div>
        <Button onClick={handleGenerate} disabled={loading || !role}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Description
        </Button>

        {generatedDescription && (
          <div className="mt-6">
            <label className="text-sm font-medium">Generated Description</label>
            <Textarea 
              className="mt-2 h-64 font-mono text-sm" 
              value={generatedDescription} 
              readOnly 
            />
            <div className="mt-2 flex gap-2">
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(generatedDescription)}>
                    Copy to Clipboard
                </Button>
                 <Button variant="default">
                    Save to Library
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobDescriptionGenerator;

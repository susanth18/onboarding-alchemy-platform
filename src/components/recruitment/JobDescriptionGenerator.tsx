import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { generateJobDescription } from "@/lib/openai";
import { Loader2, Plus, X } from "lucide-react";

const COMMON_SKILLS = [
  "React", "TypeScript", "Node.js", "Python", "Java", "AWS", "Docker", "Kubernetes",
  "Agile", "Scrum", "Project Management", "Communication", "Leadership", "Sales",
  "Marketing", "SEO", "Content Writing", "Data Analysis", "SQL", "Machine Learning"
];

const JobDescriptionGenerator = () => {
  const [role, setRole] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [tone, setTone] = useState<'professional' | 'casual' | 'innovative'>("professional");
  const [generatedResult, setGeneratedResult] = useState<{ markdown: string, suggestedSkills: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const addKeyword = (k: string) => {
    if (k && !keywords.includes(k)) {
      setKeywords([...keywords, k]);
    }
    setCurrentKeyword("");
  };

  const removeKeyword = (k: string) => {
    setKeywords(keywords.filter(kw => kw !== k));
  };

  const handleGenerate = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const result = await generateJobDescription(role, keywords, tone);
      setGeneratedResult(result);
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
          Draft inclusive, skills-based job descriptions instantly using a role taxonomy and market keywords.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role Title</label>
            <Input 
              placeholder="e.g. Senior Software Engineer" 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tone</label>
            <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="innovative">Innovative</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Skills Library & Keywords</label>
          <div className="flex gap-2">
            <Input 
                placeholder="Type a skill and press Enter" 
                value={currentKeyword} 
                onChange={(e) => setCurrentKeyword(e.target.value)} 
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword(currentKeyword);
                    }
                }}
            />
            <Button variant="secondary" onClick={() => addKeyword(currentKeyword)} disabled={!currentKeyword}>
                <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
             {keywords.map(k => (
                 <Badge key={k} variant="secondary" className="px-3 py-1">
                     {k}
                     <X className="ml-2 h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeKeyword(k)} />
                 </Badge>
             ))}
          </div>

          <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Common Skills (Click to add):</p>
              <div className="flex flex-wrap gap-1">
                  {COMMON_SKILLS.filter(s => !keywords.includes(s)).slice(0, 10).map(s => (
                      <Badge 
                        key={s} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => addKeyword(s)}
                      >
                          {s}
                      </Badge>
                  ))}
              </div>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading || !role} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Description
        </Button>

        {generatedResult && (
          <div className="mt-8 border-t pt-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4">
                 <label className="text-sm font-medium">Generated Description</label>
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generatedResult.markdown)}>
                        Copy
                    </Button>
                    <Button size="sm">
                        Save to Library
                    </Button>
                 </div>
            </div>
           
            <Textarea 
              className="min-h-[400px] font-mono text-sm leading-relaxed" 
              value={generatedResult.markdown} 
              readOnly 
            />

            {generatedResult.suggestedSkills.length > 0 && (
                 <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-blue-900 mb-2">AI Suggested Skills (Market Trends):</p>
                    <div className="flex flex-wrap gap-2">
                        {generatedResult.suggestedSkills.map(s => (
                            <Badge key={s} variant="outline" className="bg-white text-blue-800 border-blue-200">
                                {s}
                            </Badge>
                        ))}
                    </div>
                 </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobDescriptionGenerator;

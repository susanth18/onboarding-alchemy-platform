import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { parseResume, analyzeCandidate, ParsedResume, CandidateAnalysis } from "@/lib/openai";
import { Loader2, Upload, FileText, CheckCircle, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ResumeParser = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [analysis, setAnalysis] = useState<CandidateAnalysis | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setParsedData(null);
      setAnalysis(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    try {
      const data = await parseResume(file);
      setParsedData(data);
      const aiAnalysis = await analyzeCandidate(data);
      setAnalysis(aiAnalysis);
    } catch (error) {
      console.error("Error parsing resume:", error);
      toast({
          title: "Error",
          description: "Failed to parse resume.",
          variant: "destructive"
      });
    } finally {
      setParsing(false);
    }
  };

  const handleCreateProfile = () => {
      // Mock API call to create candidate
      toast({
          title: "Success",
          description: "Candidate profile created successfully.",
      });
      setFile(null);
      setParsedData(null);
      setAnalysis(null);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Resume Parser</CardTitle>
          <CardDescription>Upload a resume to extract structured data and get AI insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
            <input 
              type="file" 
              accept=".pdf,.docx,.doc" 
              className="hidden" 
              id="resume-upload"
              onChange={handleFileChange}
            />
            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                {file ? file.name : "Click to upload or drag and drop"}
              </span>
              <span className="text-xs text-gray-500 mt-1">PDF or Word documents</span>
            </label>
          </div>
          
          <Button onClick={handleParse} disabled={!file || parsing} className="w-full">
            {parsing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Parse Resume
          </Button>
        </CardContent>
      </Card>

      {parsedData && (
        <Card className="animate-in fade-in slide-in-from-bottom-2">
          <CardHeader>
            <CardTitle>Candidate Profile</CardTitle>
            <CardDescription>Extracted information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">{parsedData.name}</h3>
                    <p className="text-sm text-gray-500">{parsedData.email} • {parsedData.phone}</p>
                    {parsedData.linkedin && <p className="text-xs text-blue-500">{parsedData.linkedin}</p>}
                </div>
            </div>
            
            <div>
                <h4 className="font-medium mb-2 text-sm text-gray-700">Skills</h4>
                <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill: string, i: number) => (
                        <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full border border-gray-200">{skill}</span>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-medium mb-2 text-sm text-gray-700">Experience</h4>
                 {parsedData.experience.map((exp, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                        <p className="font-medium text-sm">{exp.title}</p>
                        <p className="text-xs text-gray-500">{exp.company} • {exp.duration}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{exp.description}</p>
                    </div>
                ))}
            </div>

             {analysis && (
                <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100 space-y-2">
                    <div className="flex justify-between items-center">
                         <h4 className="font-medium text-blue-900 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" /> AI Analysis
                        </h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            analysis.recommendation === 'Strong Hire' || analysis.recommendation === 'Hire' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            {analysis.recommendation} ({analysis.matchScore}%)
                        </span>
                    </div>
                    <p className="text-sm text-blue-800">{analysis.reasoning}</p>
                    <div className="text-xs text-blue-700">
                        <strong>Strengths:</strong> {analysis.strengths.join(", ")}
                    </div>
                </div>
            )}
            
            <Button className="w-full mt-4" onClick={handleCreateProfile}>
                <Save className="mr-2 h-4 w-4" />
                Create Candidate Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResumeParser;

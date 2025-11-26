import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { parseResume, analyzeCandidate } from "@/lib/openai";
import { Loader2, Upload, FileText, CheckCircle } from "lucide-react";

const ResumeParser = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setParsedData(null);
      setAnalysis("");
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
    } finally {
      setParsing(false);
    }
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
        <Card>
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
                </div>
            </div>
            
            <div>
                <h4 className="font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill: string, i: number) => (
                        <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{skill}</span>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-medium mb-2">Experience</h4>
                 {parsedData.experience.map((exp: any, i: number) => (
                    <div key={i} className="mb-2">
                        <p className="font-medium text-sm">{exp.title}</p>
                        <p className="text-xs text-gray-500">{exp.company} • {exp.duration}</p>
                    </div>
                ))}
            </div>

             {analysis && (
                <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
                    <h4 className="font-medium text-blue-900 mb-1 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" /> AI Analysis
                    </h4>
                    <p className="text-sm text-blue-800">{analysis}</p>
                </div>
            )}
            
            <Button className="w-full mt-4" variant="outline">Create Candidate Profile</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResumeParser;

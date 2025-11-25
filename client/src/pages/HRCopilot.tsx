
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, FileText, Mail, AlertTriangle, CheckCircle, Calendar, MessageSquare, FileSearch, Smile, BookOpen, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import BackButton from "@/components/common/BackButton";

const HRCopilot = () => {
    const [activeTab, setActiveTab] = useState("jd-generator");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Inputs
    const [role, setRole] = useState("");
    const [emailType, setEmailType] = useState("welcome");
    const [recipientName, setRecipientName] = useState("");
    const [chatQuestion, setChatQuestion] = useState("");
    const [sentimentText, setSentimentText] = useState("");

    const handleGenerateJD = async () => {
        setLoading(true);
        try {
            const res = await api.post('/ai/generate-jd', { role });
            setResult(res.data.description);
        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
        setLoading(false);
    };

    const handleGeneratePlan = async () => {
        setLoading(true);
        try {
            const res = await api.post('/ai/generate-plan', { role });
            setResult(res.data.plan);
        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
        setLoading(false);
    };

    const handleDraftEmail = async () => {
        setLoading(true);
        try {
            const res = await api.post('/ai/draft-email', { type: emailType, recipientName, role, startDate: "next Monday" });
            setResult(res.data);
        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
        setLoading(false);
    };

    const handleDetectRisks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/ai/risks');
            setResult(res.data);
        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
        setLoading(false);
    };

    const handleCheckCompliance = async () => {
        setLoading(true);
        try {
            const res = await api.get('/ai/compliance');
            setResult(res.data);
        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
        setLoading(false);
    };

    const handleSuggestMeeting = async () => {
        setLoading(true);
        try {
            const res = await api.get('/ai/suggest-meeting');
            setResult(res.data.suggestions);
        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
        setLoading(false);
    };

    const handleChat = async () => {
        setLoading(true);
        try {
            const res = await api.post('/ai/chat', { question: chatQuestion });
            setResult(res.data.answer);
        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
        setLoading(false);
    };

    const handleSentiment = async () => {
        setLoading(true);
        try {
            const res = await api.post('/ai/sentiment', { text: sentimentText });
            setResult(res.data);
        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
        setLoading(false);
    };

    const handleResources = async () => {
        setLoading(true);
        try {
            const res = await api.get('/ai/resources', { params: { role } });
            setResult(res.data);
        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
        setLoading(false);
    };

    const handleParseResume = async () => {
        setLoading(true);
        try {
            const res = await api.post('/ai/parse-resume'); // Mock upload
            setResult(res.data.extracted);
        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
        setLoading(false);
    };

    const reset = (val: string) => {
        setActiveTab(val);
        setResult(null);
    };

    return (
        <div className="container mx-auto p-6">
             <BackButton to="/" label="Back to Dashboard" />
             <div className="flex items-center mb-6">
                <Sparkles className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                    <h1 className="text-2xl font-bold">HR Copilot</h1>
                    <p className="text-muted-foreground">AI-powered tools to automate your workflow</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1">
                    <CardContent className="p-4">
                        <div className="flex flex-col space-y-1">
                            {[
                                { id: "jd-generator", label: "JD Generator", icon: FileText },
                                { id: "plan-generator", label: "Plan Generator", icon: Calendar },
                                { id: "email-drafter", label: "Email Drafter", icon: Mail },
                                { id: "risk-detector", label: "Risk Detector", icon: AlertTriangle },
                                { id: "compliance", label: "Compliance Audit", icon: CheckCircle },
                                { id: "scheduler", label: "Smart Scheduler", icon: Calendar },
                                { id: "chat-bot", label: "Ask HR Bot", icon: MessageSquare },
                                { id: "resume-parser", label: "Resume Parser", icon: FileSearch },
                                { id: "sentiment", label: "Sentiment Analysis", icon: Smile },
                                { id: "resources", label: "Resource Recommender", icon: BookOpen },
                            ].map((item) => (
                                <Button
                                    key={item.id}
                                    variant={activeTab === item.id ? "secondary" : "ghost"}
                                    className="justify-start"
                                    onClick={() => reset(item.id)}
                                >
                                    <item.icon className="h-4 w-4 mr-2" />
                                    {item.label}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>
                            {activeTab === "jd-generator" && "Job Description Generator"}
                            {activeTab === "plan-generator" && "Onboarding Plan Generator"}
                            {activeTab === "email-drafter" && "Email Drafter"}
                            {activeTab === "risk-detector" && "Employee Risk Detector"}
                            {activeTab === "compliance" && "Compliance Auditor"}
                            {activeTab === "scheduler" && "Smart Meeting Scheduler"}
                            {activeTab === "chat-bot" && "HR Policy Q&A"}
                            {activeTab === "resume-parser" && "Resume Parser"}
                            {activeTab === "sentiment" && "Feedback Sentiment Analysis"}
                            {activeTab === "resources" && "Learning Resource Recommender"}
                        </CardTitle>
                        <CardDescription>
                            Use AI to automate this task instantly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Dynamic Inputs */}
                        <div className="space-y-4 mb-6">
                            {(activeTab === "jd-generator" || activeTab === "plan-generator" || activeTab === "resources") && (
                                <div>
                                    <Label>Role Title</Label>
                                    <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Software Engineer" />
                                    <Button className="mt-2" onClick={
                                        activeTab === "jd-generator" ? handleGenerateJD :
                                        activeTab === "plan-generator" ? handleGeneratePlan : handleResources
                                    } disabled={loading}>
                                        {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Generate
                                    </Button>
                                </div>
                            )}

                            {activeTab === "email-drafter" && (
                                <div className="space-y-3">
                                    <div>
                                        <Label>Type</Label>
                                        <Select value={emailType} onValueChange={setEmailType}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="welcome">Welcome Email</SelectItem>
                                                <SelectItem value="offer">Offer Letter</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Recipient Name</Label>
                                        <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Role</Label>
                                        <Input value={role} onChange={(e) => setRole(e.target.value)} />
                                    </div>
                                    <Button onClick={handleDraftEmail} disabled={loading}>
                                        {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Draft Email
                                    </Button>
                                </div>
                            )}

                            {activeTab === "chat-bot" && (
                                <div>
                                    <Label>Question</Label>
                                    <Input value={chatQuestion} onChange={(e) => setChatQuestion(e.target.value)} placeholder="How many holidays do we get?" />
                                    <Button className="mt-2" onClick={handleChat} disabled={loading}>
                                        {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Ask AI
                                    </Button>
                                </div>
                            )}

                            {activeTab === "sentiment" && (
                                <div>
                                    <Label>Feedback Text</Label>
                                    <Textarea value={sentimentText} onChange={(e) => setSentimentText(e.target.value)} placeholder="Paste feedback here..." />
                                    <Button className="mt-2" onClick={handleSentiment} disabled={loading}>
                                        {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Analyze
                                    </Button>
                                </div>
                            )}

                            {(activeTab === "risk-detector" || activeTab === "compliance" || activeTab === "scheduler" || activeTab === "resume-parser") && (
                                <Button onClick={
                                    activeTab === "risk-detector" ? handleDetectRisks :
                                    activeTab === "compliance" ? handleCheckCompliance :
                                    activeTab === "scheduler" ? handleSuggestMeeting : handleParseResume
                                } disabled={loading}>
                                    {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Run Analysis
                                </Button>
                            )}
                        </div>

                        {/* Results Display */}
                        {result && (
                            <div className="bg-slate-50 p-4 rounded-lg border">
                                <h3 className="font-medium mb-2 text-sm text-muted-foreground">Result:</h3>
                                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
             </div>
        </div>
    );
};

export default HRCopilot;

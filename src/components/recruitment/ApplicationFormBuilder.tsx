import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Save, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Question {
    id: number;
    text: string;
    isKnockout: boolean;
}

const ApplicationFormBuilder = () => {
  const [questions, setQuestions] = useState<Question[]>([
      { id: 1, text: "Are you authorized to work in this country?", isKnockout: true }
  ]);
  const { toast } = useToast();

  const addQuestion = () => {
      setQuestions([...questions, { id: Date.now(), text: "", isKnockout: false }]);
  };

  const removeQuestion = (id: number) => {
      setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, field: keyof Question, value: any) => {
      setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleSave = () => {
      toast({
          title: "Form Saved",
          description: "Application form configuration has been updated.",
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Form Designer</CardTitle>
        <CardDescription>Configure questions and set knockout logic to filter candidates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            {questions.map((q, index) => (
                <div key={q.id} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                    <span className="font-mono text-gray-500 w-6">{index + 1}.</span>
                    <Input 
                        value={q.text} 
                        onChange={(e) => updateQuestion(q.id, 'text', e.target.value)} 
                        placeholder="Enter question text..."
                        className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Knockout?</label>
                        <Switch 
                            checked={q.isKnockout}
                            onCheckedChange={(checked) => updateQuestion(q.id, 'isKnockout', checked)}
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            ))}
        </div>

        <Button onClick={addQuestion} variant="outline" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>

        <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost">
                <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
            <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save Form
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationFormBuilder;


import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import { FileText } from "lucide-react";

const Documents = () => {
  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" label="Back to Dashboard" />
      
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Document Management</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                This feature is currently under development. Soon you'll be able to manage all your important documents here.
              </p>
              <div className="border rounded-lg p-4 bg-secondary/10 max-w-md mx-auto">
                <p className="text-sm">
                  Coming soon: Upload, organize, and share company documents, policies, and templates with your team.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;

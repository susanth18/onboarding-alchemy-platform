
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import AddTeamForm from "@/components/teams/AddTeamForm";
import TeamList from "@/components/teams/TeamList";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const Teams: React.FC = () => {
  const [showAddTeamSheet, setShowAddTeamSheet] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleAddTeamSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["teams"] });
    setShowAddTeamSheet(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Teams</h1>

        <Sheet open={showAddTeamSheet} onOpenChange={setShowAddTeamSheet}>
          <SheetTrigger asChild>
            <Button className="flex items-center">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md overflow-auto">
            <SheetHeader>
              <SheetTitle>Add New Team</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <AddTeamForm onSuccess={handleAddTeamSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <TeamList />
    </div>
  );
};

export default Teams;

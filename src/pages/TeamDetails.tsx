
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import AddTeamMemberForm from "@/components/teams/AddTeamMemberForm";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  employees: {
    id: string;
    name: string;
    position: string;
  };
}

const fetchTeamDetails = async (teamId: string) => {
  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(*, employees(*))")
    .eq("id", teamId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const TeamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddMemberSheet, setShowAddMemberSheet] = useState(false);

  const { data: team, isLoading, isError } = useQuery({
    queryKey: ["team", id],
    queryFn: () => fetchTeamDetails(id!),
    enabled: !!id,
  });

  const handleAddMemberSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["team", id] });
    setShowAddMemberSheet(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div>Error fetching team details.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/teams")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-gray-500 mt-2">{team.description}</p>
        </div>
        <Sheet open={showAddMemberSheet} onOpenChange={setShowAddMemberSheet}>
          <SheetTrigger asChild>
            <Button className="flex items-center mt-4 md:mt-0">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add a New Team Member</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <AddTeamMemberForm teamId={id!} onSuccess={handleAddMemberSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <h2 className="text-2xl font-bold mb-4">Team Members</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {team.team_members.map((member: TeamMember) => (
          <Card key={member.employees.id}>
            <CardHeader>
              <CardTitle>{member.employees.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{member.employees.position}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamDetails;


import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Team {
  id: string;
  name: string;
  description: string;
}

const fetchTeams = async () => {
  const { data, error } = await supabase.from("teams").select("*");
  if (error) throw new Error(error.message);
  return data;
};

const TeamList: React.FC = () => {
  const { data: teams, isLoading, isError } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div>Error fetching teams.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams?.map((team) => (
        <Link to={`/teams/${team.id}`} key={team.id}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{team.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default TeamList;

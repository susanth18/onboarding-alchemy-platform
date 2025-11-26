import React from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import JobDescriptionGenerator from "@/components/recruitment/JobDescriptionGenerator";
import ResumeParser from "@/components/recruitment/ResumeParser";
import RequisitionBuilder from "@/components/recruitment/RequisitionBuilder";
import ApplicationFormBuilder from "@/components/recruitment/ApplicationFormBuilder";
import InterviewScheduler from "@/components/recruitment/InterviewScheduler";
import CandidateNurture from "@/components/recruitment/CandidateNurture";
import OfferGuidance from "@/components/recruitment/OfferGuidance";
import SelfSchedulingConfig from "@/components/recruitment/SelfSchedulingConfig";

const Recruitment = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Talent Acquisition</h1>
            <p className="text-gray-500 mt-2">Manage your recruitment lifecycle with AI-driven insights.</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
              <TabsTrigger value="jobs">Job Descriptions</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
              <TabsTrigger value="nurture">Nurture</TabsTrigger>
              <TabsTrigger value="offers">Offers</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Requisitions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+2 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">48</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time to Hire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24 days</div>
                    <p className="text-xs text-muted-foreground">-3 days from last month</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="requisitions">
               <RequisitionBuilder />
            </TabsContent>

            <TabsContent value="jobs">
              <JobDescriptionGenerator />
            </TabsContent>

            <TabsContent value="applications">
               <ApplicationFormBuilder />
            </TabsContent>

            <TabsContent value="candidates">
              <ResumeParser />
            </TabsContent>

             <TabsContent value="interviews">
               <div className="space-y-6">
                <InterviewScheduler />
                <SelfSchedulingConfig />
               </div>
            </TabsContent>

            <TabsContent value="nurture">
                <CandidateNurture />
            </TabsContent>

            <TabsContent value="offers">
                <OfferGuidance />
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Recruitment;

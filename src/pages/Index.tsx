
import { useState } from "react";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { Dashboard } from "@/components/Dashboard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskForm } from "@/components/TaskForm";

const Index = () => {
  return (
    <WorkspaceProvider>
      <TaskProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1 overflow-auto">
              <Dashboard />
            </main>
          </div>
        </SidebarProvider>
      </TaskProvider>
    </WorkspaceProvider>
  );
};

export default Index;


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { Dashboard } from "@/components/Dashboard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Index = () => {
  const navigate = useNavigate();

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

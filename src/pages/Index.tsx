
import { useState } from "react";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { Dashboard } from "@/components/Dashboard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskForm } from "@/components/TaskForm";
import { CalendarView } from "@/components/CalendarView";
import { Task } from "@/contexts/TaskContext";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "calendar" | "today" | "upcoming" | "priority">("dashboard");
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const { toast } = useToast();
  
  const handleOpenTaskForm = (task: Task | null = null) => {
    setCurrentTask(task);
    setIsTaskFormOpen(true);
  };
  
  const handleCloseTaskForm = () => {
    setCurrentTask(null);
    setIsTaskFormOpen(false);
  };
  
  const renderCurrentView = () => {
    switch(currentView) {
      case "dashboard":
        return <Dashboard onOpenTaskForm={handleOpenTaskForm} />;
      case "calendar":
        return <CalendarView onEditTask={handleOpenTaskForm} />;
      case "today":
        return <Dashboard onOpenTaskForm={handleOpenTaskForm} filter="today" />;
      case "upcoming":
        return <Dashboard onOpenTaskForm={handleOpenTaskForm} filter="upcoming" />;
      case "priority":
        return <Dashboard onOpenTaskForm={handleOpenTaskForm} filter="priority" />;
      default:
        return <Dashboard onOpenTaskForm={handleOpenTaskForm} />;
    }
  };
  
  return (
    <WorkspaceProvider>
      <TaskProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar onViewChange={setCurrentView} currentView={currentView} />
            <main className="flex-1 overflow-auto">
              {renderCurrentView()}
              <TaskForm 
                open={isTaskFormOpen} 
                onClose={handleCloseTaskForm}
                task={currentTask} 
              />
            </main>
          </div>
        </SidebarProvider>
      </TaskProvider>
    </WorkspaceProvider>
  );
};

export default Index;

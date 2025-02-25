
import React, { useState, useEffect } from "react";
import { 
  Plus,
  Filter,
  Search,
  Calendar,
  MoreHorizontal,
  Clock,
  CheckCircle,
  Flag
} from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/TaskCard";
import { formatDistance } from "date-fns";
import { pt } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardProps {
  onOpenTaskForm: () => void;
}

export function Dashboard({ onOpenTaskForm }: DashboardProps) {
  const { currentWorkspace } = useWorkspace();
  const { tasks, getTasksByWorkspace, setSelectedTask } = useTask();
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceTasks, setWorkspaceTasks] = useState<any[]>([]);
  
  useEffect(() => {
    if (currentWorkspace) {
      const filtered = getTasksByWorkspace(currentWorkspace.id);
      setWorkspaceTasks(filtered);
    }
  }, [currentWorkspace, tasks]);
  
  const filteredTasks = workspaceTasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const urgentTasks = filteredTasks.filter(task => task.priority === "urgent");
  const highTasks = filteredTasks.filter(task => task.priority === "high");
  const mediumTasks = filteredTasks.filter(task => task.priority === "medium");
  const lowTasks = filteredTasks.filter(task => task.priority === "low");
  
  const pendingTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);
  
  // Tarefas próximas do prazo (nos próximos 3 dias)
  const upcomingTasks = pendingTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const diffDays = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  const handleOpenNewTaskForm = () => {
    setSelectedTask(null);
    onOpenTaskForm();
  };

  const handleFilterClick = () => {
    // Implement filter functionality here
    console.log("Filter clicked");
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{currentWorkspace?.name || "Meu Espaço"}</h1>
          <p className="text-muted-foreground">
            {pendingTasks.length} tarefas pendentes, {completedTasks.length} concluídas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              className="pl-8 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="gap-1" onClick={handleOpenNewTaskForm}>
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Flag className="h-4 w-4 text-[hsl(var(--priority-urgent))]" />
              Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{urgentTasks.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Próximas do prazo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{upcomingTasks.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Concluídas hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {completedTasks.filter(task => {
                const today = new Date();
                const updatedAt = new Date(task.updatedAt);
                return updatedAt.getDate() === today.getDate() &&
                  updatedAt.getMonth() === today.getMonth() &&
                  updatedAt.getFullYear() === today.getFullYear();
              }).length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Total de tarefas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredTasks.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
          </TabsList>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Por data (mais recente)</DropdownMenuItem>
              <DropdownMenuItem>Por data (mais antiga)</DropdownMenuItem>
              <DropdownMenuItem>Por prioridade</DropdownMenuItem>
              <DropdownMenuItem>Por nome (A-Z)</DropdownMenuItem>
              <DropdownMenuItem>Por nome (Z-A)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEditTask={() => {
                    setSelectedTask(task);
                    onOpenTaskForm();
                  }}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Nenhuma tarefa encontrada.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTasks.length > 0 ? (
              pendingTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEditTask={() => {
                    setSelectedTask(task);
                    onOpenTaskForm();
                  }}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Nenhuma tarefa pendente.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTasks.length > 0 ? (
              completedTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEditTask={() => {
                    setSelectedTask(task);
                    onOpenTaskForm();
                  }}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Nenhuma tarefa concluída.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

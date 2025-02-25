
import { useState } from "react";
import { 
  Home, 
  Briefcase, 
  Calendar, 
  Settings, 
  CheckCircle, 
  Clock, 
  Flag,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AppSidebarProps {
  onViewChange: (view: "dashboard" | "calendar" | "today" | "upcoming" | "priority") => void;
  currentView: string;
}

export function AppSidebar({ onViewChange, currentView }: AppSidebarProps) {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const { state } = useSidebar();
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  const mainMenuItems = [
    {
      title: "Visão Geral",
      view: "dashboard",
      icon: Home,
    },
    {
      title: "Hoje",
      view: "today",
      icon: CheckCircle,
    },
    {
      title: "Próximas",
      view: "upcoming",
      icon: Clock,
    },
    {
      title: "Calendário",
      view: "calendar",
      icon: Calendar,
    },
    {
      title: "Prioritárias",
      view: "priority",
      icon: Flag,
    }
  ];

  const handleWorkspaceClick = (workspace: any) => {
    setCurrentWorkspace(workspace);
    toast({
      title: "Espaço de trabalho alterado",
      description: `Você está agora no espaço "${workspace.name}"`,
    });
  };

  const handleFilterClick = () => {
    setIsFilterDialogOpen(true);
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-2">
          <div className="flex items-center justify-between w-full px-2 py-1">
            <div className="flex items-center space-x-2 font-semibold">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>TaskMaster</span>
            </div>
            <SidebarTrigger className="h-8 w-8 p-0">
              {state === "expanded" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </SidebarTrigger>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 py-1.5">Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      tooltip={item.title}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        currentView === item.view && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                      onClick={() => onViewChange(item.view as any)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Filtrar"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={handleFilterClick}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filtrar</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <div className="flex items-center justify-between px-2 py-1.5">
              <SidebarGroupLabel>Espaços de Trabalho</SidebarGroupLabel>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Adicionar Espaço">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {workspaces.map((workspace) => (
                  <SidebarMenuItem key={workspace.id}>
                    <SidebarMenuButton 
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        currentWorkspace?.id === workspace.id && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                      onClick={() => handleWorkspaceClick(workspace)}
                      onMouseEnter={() => setIsHovered(workspace.id)}
                      onMouseLeave={() => setIsHovered(null)}
                      tooltip={workspace.name}
                    >
                      <div 
                        className="flex items-center justify-center h-5 w-5 rounded-md"
                        style={{ backgroundColor: workspace.color }}
                      >
                        <Briefcase className="h-3 w-3 text-white" />
                      </div>
                      <span>{workspace.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Configurações do aplicativo irão aparecer aqui.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filtrar Tarefas</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Opções de filtro aparecerão aqui.</p>
            <div className="grid gap-4 mt-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Prioridade</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">Urgente</Button>
                  <Button variant="outline" size="sm">Alta</Button>
                  <Button variant="outline" size="sm">Média</Button>
                  <Button variant="outline" size="sm">Baixa</Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">Pendentes</Button>
                  <Button variant="outline" size="sm">Concluídas</Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsFilterDialogOpen(false)} variant="outline">Cancelar</Button>
            <Button onClick={() => setIsFilterDialogOpen(false)}>Aplicar Filtros</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Custom SidebarTrigger component
function SidebarTrigger({ className, children, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={toggleSidebar}
      {...props}
    >
      {children || <ChevronRight />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

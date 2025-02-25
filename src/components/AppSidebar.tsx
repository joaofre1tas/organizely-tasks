
import { useState } from "react";
import { 
  Home, 
  Briefcase, 
  Folder, 
  Calendar, 
  Settings, 
  CheckCircle, 
  Clock, 
  Flag, 
  Plus,
  ChevronRight
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
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function AppSidebar() {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const mainMenuItems = [
    {
      title: "Visão Geral",
      url: "/",
      icon: Home,
    },
    {
      title: "Hoje",
      url: "/today",
      icon: CheckCircle,
    },
    {
      title: "Próximas",
      url: "/upcoming",
      icon: Clock,
    },
    {
      title: "Calendário",
      url: "/calendar",
      icon: Calendar,
    },
    {
      title: "Prioritárias",
      url: "/priorities",
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

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2 font-semibold">
          <CheckCircle className="h-5 w-5 text-primary" />
          <span>TaskMaster</span>
        </div>
        <SidebarTrigger className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </SidebarTrigger>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a 
                      href={item.url}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
        <Button variant="outline" className="w-full flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Configurações</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

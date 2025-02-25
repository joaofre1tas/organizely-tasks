
import React, { createContext, useContext, useState, useEffect } from "react";

export type Workspace = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type WorkspaceContextType = {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Omit<Workspace, "id">) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
};

const defaultWorkspaces: Workspace[] = [
  {
    id: "1",
    name: "Pessoal",
    icon: "home",
    color: "hsl(var(--primary))",
  },
  {
    id: "2",
    name: "Trabalho",
    icon: "briefcase",
    color: "hsl(var(--priority-medium))",
  },
];

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: defaultWorkspaces,
  currentWorkspace: null,
  setCurrentWorkspace: () => null,
  addWorkspace: () => null,
  updateWorkspace: () => null,
  deleteWorkspace: () => null,
});

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const saved = localStorage.getItem("workspaces");
    return saved ? JSON.parse(saved) : defaultWorkspaces;
  });
  
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(() => {
    const saved = localStorage.getItem("currentWorkspace");
    return saved ? JSON.parse(saved) : workspaces[0];
  });

  useEffect(() => {
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem("currentWorkspace", JSON.stringify(currentWorkspace));
    }
  }, [currentWorkspace]);

  const addWorkspace = (workspace: Omit<Workspace, "id">) => {
    const newWorkspace = {
      ...workspace,
      id: Math.random().toString(36).substring(2, 9),
    };
    setWorkspaces([...workspaces, newWorkspace]);
  };

  const updateWorkspace = (id: string, updates: Partial<Workspace>) => {
    setWorkspaces(workspaces.map(ws => 
      ws.id === id ? { ...ws, ...updates } : ws
    ));
    
    if (currentWorkspace?.id === id) {
      setCurrentWorkspace({ ...currentWorkspace, ...updates });
    }
  };

  const deleteWorkspace = (id: string) => {
    setWorkspaces(workspaces.filter(ws => ws.id !== id));
    
    if (currentWorkspace?.id === id && workspaces.length > 1) {
      // Set first available workspace as current
      const remainingWorkspaces = workspaces.filter(ws => ws.id !== id);
      setCurrentWorkspace(remainingWorkspaces[0]);
    }
  };

  return (
    <WorkspaceContext.Provider 
      value={{ 
        workspaces, 
        currentWorkspace, 
        setCurrentWorkspace, 
        addWorkspace, 
        updateWorkspace, 
        deleteWorkspace 
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);

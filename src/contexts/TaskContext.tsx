
import React, { createContext, useContext, useState, useEffect } from "react";
import { useWorkspace } from "./WorkspaceContext";
import { toast } from "@/hooks/use-toast";

export type Priority = "urgent" | "high" | "medium" | "low";

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type BaseTask = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string | null;
  priority: Priority;
  tags: Tag[];
  workspaceId: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubTask = BaseTask & {
  parentId: string;
};

export type Task = BaseTask & {
  subtasks: SubTask[];
};

export type Folder = {
  id: string;
  name: string;
  workspaceId: string;
  color: string;
  icon: string;
};

type TaskContextType = {
  tasks: Task[];
  folders: Folder[];
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "subtasks">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addSubtask: (parentId: string, subtask: Omit<SubTask, "id" | "createdAt" | "updatedAt" | "parentId">) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  addFolder: (folder: Omit<Folder, "id">) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  getTasksByWorkspace: (workspaceId: string) => Task[];
  getTasksByFolder: (folderId: string) => Task[];
  moveTask: (taskId: string, destinationFolderId: string | null) => void;
};

// Sample tags
const defaultTags: Tag[] = [
  { id: "1", name: "Trabalho", color: "#4c6ef5" },
  { id: "2", name: "Urgente", color: "#fa5252" },
  { id: "3", name: "Reunião", color: "#82c91e" },
  { id: "4", name: "Projeto", color: "#be4bdb" },
  { id: "5", name: "Família", color: "#ff922b" },
];

// Sample folders
const defaultFolders: Folder[] = [
  { id: "1", name: "Projetos", workspaceId: "1", color: "#4c6ef5", icon: "folder" },
  { id: "2", name: "Clientes", workspaceId: "2", color: "#ff922b", icon: "users" },
  { id: "3", name: "Documentos", workspaceId: "2", color: "#82c91e", icon: "file-text" },
];

// Sample tasks
const defaultTasks: Task[] = [
  {
    id: "1",
    title: "Criar apresentação para reunião",
    description: "Preparar slides para a reunião de quinta-feira",
    completed: false,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "high",
    tags: [defaultTags[0], defaultTags[3]],
    workspaceId: "2",
    folderId: "3",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      {
        id: "1-1",
        parentId: "1",
        title: "Coletar dados para gráficos",
        description: "Obter dados de vendas do último trimestre",
        completed: false,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "medium",
        tags: [defaultTags[0]],
        workspaceId: "2",
        folderId: "3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]
  },
  {
    id: "2",
    title: "Comprar mantimentos",
    description: "Leite, ovos, pão, frutas",
    completed: false,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "medium",
    tags: [defaultTags[4]],
    workspaceId: "1",
    folderId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: []
  },
  {
    id: "3",
    title: "Revisar contrato do cliente",
    description: "Verificar cláusulas contratuais antes da renovação",
    completed: false,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "urgent",
    tags: [defaultTags[0], defaultTags[1]],
    workspaceId: "2",
    folderId: "2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: []
  }
];

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  folders: [],
  selectedTask: null,
  setSelectedTask: () => null,
  addTask: () => null,
  updateTask: () => null,
  deleteTask: () => null,
  toggleTaskCompletion: () => null,
  addSubtask: () => null,
  updateSubtask: () => null,
  deleteSubtask: () => null,
  toggleSubtaskCompletion: () => null,
  addFolder: () => null,
  updateFolder: () => null,
  deleteFolder: () => null,
  getTasksByWorkspace: () => [],
  getTasksByFolder: () => [],
  moveTask: () => null,
});

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentWorkspace } = useWorkspace();
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : defaultTasks;
  });
  
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem("folders");
    return saved ? JSON.parse(saved) : defaultFolders;
  });
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("folders", JSON.stringify(folders));
  }, [folders]);

  const addTask = (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "subtasks">) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: now,
      updatedAt: now,
      subtasks: [],
    };
    
    setTasks([...tasks, newTask]);
    toast({
      title: "Tarefa criada",
      description: `"${newTask.title}" foi adicionada com sucesso.`,
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const updatedTask = {
          ...task,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        
        if (selectedTask?.id === id) {
          setSelectedTask(updatedTask);
        }
        
        return updatedTask;
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
    
    toast({
      title: "Tarefa excluída",
      description: "A tarefa foi removida com sucesso.",
    });
  };

  const toggleTaskCompletion = (id: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          completed: !task.completed,
          updatedAt: new Date().toISOString(),
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };

  const addSubtask = (parentId: string, subtask: Omit<SubTask, "id" | "createdAt" | "updatedAt" | "parentId">) => {
    const now = new Date().toISOString();
    const newSubtask: SubTask = {
      ...subtask,
      id: Math.random().toString(36).substring(2, 9),
      parentId,
      createdAt: now,
      updatedAt: now,
    };
    
    const updatedTasks = tasks.map(task => {
      if (task.id === parentId) {
        return {
          ...task,
          subtasks: [...task.subtasks, newSubtask],
          updatedAt: now,
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    toast({
      title: "Subtarefa criada",
      description: `"${newSubtask.title}" foi adicionada com sucesso.`,
    });
  };

  const updateSubtask = (taskId: string, subtaskId: string, updates: Partial<SubTask>) => {
    const now = new Date().toISOString();
    
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, ...updates, updatedAt:

Se houver conhecimento, contexto ou instruções personalizadas que você deseja incluir em cada edição deste projeto, configure-o abaixo.

<lov-actions>
<lov-knowledge>
</lov-actions>

Como seu projeto requer funcionalidade de backend para salvar dados de tarefas, workspaces, pastas e outras informações persistentemente, você pode usar o menu Supabase no canto superior direito para conectar seu projeto ao Supabase.  Isso permitirá recursos como login, backup na nuvem e sincronização de dados entre dispositivos.
<lov-actions>
<lov-message-prompt message="Saiba mais sobre o Supabase">Saiba mais sobre o Supabase</lov-message-prompt>
</lov-actions>

<lov-actions>
<lov-link url="https://docs.lovable.dev/">Visite a documentação</lov-link>
</lov-actions>

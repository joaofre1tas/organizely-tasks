
import React, { createContext, useContext, useState, useEffect } from "react";
import { useWorkspace } from "./WorkspaceContext";
import { toast } from "@/hooks/use-toast";

export type Priority = "urgent" | "high" | "medium" | "low";
export type Status = "todo" | "in-progress" | "completed";

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
  status: Status;
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
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "subtasks" | "completed" | "status">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  updateTaskStatus: (id: string, status: Status) => void;
  addSubtask: (parentId: string, subtask: Omit<SubTask, "id" | "createdAt" | "updatedAt" | "parentId" | "completed" | "status">) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  addFolder: (folder: Omit<Folder, "id">) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  getTasksByWorkspace: (workspaceId: string) => Task[];
  getTasksByFolder: (folderId: string) => Task[];
  moveTask: (taskId: string, destinationFolderId: string | null) => void;
  getTags: () => Tag[];
  addTag: (tag: Omit<Tag, "id">) => Tag;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
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
    status: "todo",
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
        status: "todo",
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
    status: "todo",
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
    status: "todo",
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
  updateTaskStatus: () => null,
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
  getTags: () => [],
  addTag: () => ({ id: "", name: "", color: "" }),
  updateTag: () => null,
  deleteTag: () => null,
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
  
  const [tags, setTags] = useState<Tag[]>(() => {
    const saved = localStorage.getItem("tags");
    return saved ? JSON.parse(saved) : defaultTags;
  });
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("folders", JSON.stringify(folders));
  }, [folders]);
  
  useEffect(() => {
    localStorage.setItem("tags", JSON.stringify(tags));
  }, [tags]);

  const addTask = (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "subtasks" | "completed" | "status">) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: now,
      updatedAt: now,
      subtasks: [],
      completed: false,
      status: "todo"
    };
    
    setTasks([...tasks, newTask]);
    toast({
      title: "Tarefa criada",
      description: `"${newTask.title}" foi adicionada com sucesso.`,
    });
    
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const updatedTask = {
          ...task,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        
        // If status is changed to completed, mark completed as true
        if (updates.status === "completed" && !updatedTask.completed) {
          updatedTask.completed = true;
        }
        
        // If status is changed from completed, mark completed as false
        if (updates.status && updates.status !== "completed" && updatedTask.completed) {
          updatedTask.completed = false;
        }
        
        // If completed is changed, update status accordingly
        if (updates.completed !== undefined) {
          updatedTask.status = updates.completed ? "completed" : 
            (updatedTask.status === "completed" ? "todo" : updatedTask.status);
        }
        
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
        const completed = !task.completed;
        return {
          ...task,
          completed,
          status: completed ? "completed" : "todo",
          updatedAt: new Date().toISOString(),
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };
  
  const updateTaskStatus = (id: string, status: Status) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          status,
          completed: status === "completed",
          updatedAt: new Date().toISOString(),
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };

  const addSubtask = (parentId: string, subtask: Omit<SubTask, "id" | "createdAt" | "updatedAt" | "parentId" | "completed" | "status">) => {
    const now = new Date().toISOString();
    const newSubtask: SubTask = {
      ...subtask,
      id: Math.random().toString(36).substring(2, 9),
      parentId,
      createdAt: now,
      updatedAt: now,
      completed: false,
      status: "todo"
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
          subtasks: task.subtasks.map(subtask => {
            if (subtask.id === subtaskId) {
              const updatedSubtask = { 
                ...subtask, 
                ...updates, 
                updatedAt: now 
              };
              
              // Update completed and status consistency
              if (updates.status === "completed" && !updatedSubtask.completed) {
                updatedSubtask.completed = true;
              }
              
              // If status is changed from completed, mark completed as false
              if (updates.status && updates.status !== "completed" && updatedSubtask.completed) {
                updatedSubtask.completed = false;
              }
              
              // If completed is changed, update status accordingly
              if (updates.completed !== undefined) {
                updatedSubtask.status = updates.completed ? "completed" : 
                  (updatedSubtask.status === "completed" ? "todo" : updatedSubtask.status);
              }
              
              return updatedSubtask;
            }
            return subtask;
          }),
          updatedAt: now,
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId),
          updatedAt: new Date().toISOString(),
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    toast({
      title: "Subtarefa excluída",
      description: "A subtarefa foi removida com sucesso.",
    });
  };

  const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(subtask => {
            if (subtask.id === subtaskId) {
              const completed = !subtask.completed;
              return {
                ...subtask,
                completed,
                status: completed ? "completed" : "todo",
                updatedAt: new Date().toISOString(),
              };
            }
            return subtask;
          }),
          updatedAt: new Date().toISOString(),
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };

  const addFolder = (folder: Omit<Folder, "id">) => {
    const newFolder: Folder = {
      ...folder,
      id: Math.random().toString(36).substring(2, 9),
    };
    
    setFolders([...folders, newFolder]);
    
    toast({
      title: "Pasta criada",
      description: `"${newFolder.name}" foi adicionada com sucesso.`,
    });
    
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    const updatedFolders = folders.map(folder => {
      if (folder.id === id) {
        return {
          ...folder,
          ...updates,
        };
      }
      return folder;
    });
    
    setFolders(updatedFolders);
  };

  const deleteFolder = (id: string) => {
    // Move tasks from this folder to no folder
    const tasksToUpdate = tasks.filter(task => task.folderId === id);
    
    if (tasksToUpdate.length > 0) {
      const updatedTasks = tasks.map(task => 
        task.folderId === id 
          ? { ...task, folderId: null, updatedAt: new Date().toISOString() }
          : task
      );
      
      setTasks(updatedTasks);
    }
    
    setFolders(folders.filter(folder => folder.id !== id));
    
    toast({
      title: "Pasta excluída",
      description: "A pasta foi removida com sucesso.",
    });
  };

  const getTasksByWorkspace = (workspaceId: string) => {
    return tasks.filter(task => task.workspaceId === workspaceId);
  };

  const getTasksByFolder = (folderId: string) => {
    return tasks.filter(task => task.folderId === folderId);
  };

  const moveTask = (taskId: string, destinationFolderId: string | null) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          folderId: destinationFolderId,
          updatedAt: new Date().toISOString(),
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    toast({
      title: "Tarefa movida",
      description: "A tarefa foi movida com sucesso.",
    });
  };
  
  const getTags = () => {
    return tags;
  };
  
  const addTag = (tag: Omit<Tag, "id">) => {
    const newTag: Tag = {
      ...tag,
      id: Math.random().toString(36).substring(2, 9),
    };
    
    setTags([...tags, newTag]);
    
    toast({
      title: "Tag criada",
      description: `"${newTag.name}" foi adicionada com sucesso.`,
    });
    
    return newTag;
  };
  
  const updateTag = (id: string, updates: Partial<Tag>) => {
    const updatedTags = tags.map(tag => {
      if (tag.id === id) {
        return {
          ...tag,
          ...updates,
        };
      }
      return tag;
    });
    
    setTags(updatedTags);
  };
  
  const deleteTag = (id: string) => {
    // Remove tag from all tasks
    const updatedTasks = tasks.map(task => ({
      ...task,
      tags: task.tags.filter(tag => tag.id !== id),
      subtasks: task.subtasks.map(subtask => ({
        ...subtask,
        tags: subtask.tags.filter(tag => tag.id !== id)
      }))
    }));
    
    setTasks(updatedTasks);
    setTags(tags.filter(tag => tag.id !== id));
    
    toast({
      title: "Tag excluída",
      description: "A tag foi removida com sucesso.",
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        folders,
        selectedTask,
        setSelectedTask,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        updateTaskStatus,
        addSubtask,
        updateSubtask,
        deleteSubtask,
        toggleSubtaskCompletion,
        addFolder,
        updateFolder,
        deleteFolder,
        getTasksByWorkspace,
        getTasksByFolder,
        moveTask,
        getTags,
        addTag,
        updateTag,
        deleteTag,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => useContext(TaskContext);

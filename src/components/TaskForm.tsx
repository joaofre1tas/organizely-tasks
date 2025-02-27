
import React, { useState, useEffect } from "react";
import { useTask, Priority, Tag as TaskTag, Task, Status } from "@/contexts/TaskContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TaskFormFields } from "./task/TaskFormFields";
import { NewTagDialog } from "./task/NewTagDialog";
import { NewFolderDialog } from "./task/NewFolderDialog";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

export function TaskForm({ open, onClose, task }: TaskFormProps) {
  const { currentWorkspace } = useWorkspace();
  const { addTask, updateTask, folders, addTag, addFolder, getTags } = useTask();
  const { toast } = useToast();
  
  const isEditMode = !!task;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<TaskTag[]>([]);
  const [status, setStatus] = useState<Status>("todo");
  
  const [isNewTagDialogOpen, setIsNewTagDialogOpen] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<TaskTag[]>([]);
  
  useEffect(() => {
    setAvailableTags(getTags());
  }, [getTags]);
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setSelectedFolder(task.folderId);
      setStatus(task.status);
      
      if (task.dueDate) {
        setDueDate(new Date(task.dueDate));
      } else {
        setDueDate(null);
      }
      
      setSelectedTags(task.tags || []);
    } else {
      resetForm();
    }
  }, [task]);
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate(null);
    setSelectedFolder(null);
    setSelectedTags([]);
    setStatus("todo");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título da tarefa é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isEditMode && task) {
        await updateTask(task.id, {
          title,
          description,
          priority,
          dueDate: dueDate ? dueDate.toISOString() : null,
          folderId: selectedFolder,
          tags: selectedTags,
          status
        });
        
        toast({
          title: "Sucesso",
          description: "Tarefa atualizada com sucesso",
        });
      } else if (currentWorkspace) {
        await addTask({
          title,
          description,
          priority,
          dueDate: dueDate ? dueDate.toISOString() : null,
          folderId: selectedFolder,
          tags: selectedTags,
          workspaceId: currentWorkspace.id,
          status
        });
        
        toast({
          title: "Sucesso",
          description: "Tarefa criada com sucesso",
        });
      }
      
      resetForm();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tarefa",
        variant: "destructive",
      });
    }
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const toggleTag = (tag: TaskTag) => {
    setSelectedTags(prev => 
      prev.some(t => t.id === tag.id)
        ? prev.filter(t => t.id !== tag.id)
        : [...prev, tag]
    );
  };
  
  const createNewTag = async (name: string, color: string) => {
    try {
      const createdTag = addTag({
        name,
        color
      });
      
      setAvailableTags(prev => [...prev, createdTag]);
      setSelectedTags(prev => [...prev, createdTag]);
      
      toast({
        title: "Sucesso",
        description: "Tag criada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao criar tag:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a tag",
        variant: "destructive",
      });
    }
  };
  
  const createNewFolder = async (name: string) => {
    try {
      if (!currentWorkspace) {
        toast({
          title: "Erro",
          description: "Nenhum espaço de trabalho selecionado",
          variant: "destructive",
        });
        return;
      }
      
      const createdFolder = addFolder({
        name,
        workspaceId: currentWorkspace.id,
        color: "#808080",
        icon: "folder"
      });
      
      setSelectedFolder(createdFolder.id);
      
      toast({
        title: "Sucesso",
        description: "Pasta criada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao criar pasta:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a pasta",
        variant: "destructive",
      });
    }
  };
  
  const formatText = (command: string) => {
    const textarea = document.getElementById('task-description') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    let formattedText = '';
    
    switch (command) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'bullet':
        formattedText = `<ul><li>${selectedText}</li></ul>`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newText = description.substring(0, start) + formattedText + description.substring(end);
    setDescription(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
  };
  
  const workspaceFolders = folders.filter(
    folder => currentWorkspace && folder.workspaceId === currentWorkspace.id
  );
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar tarefa" : "Nova tarefa"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <TaskFormFields
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            priority={priority}
            setPriority={setPriority}
            status={status}
            setStatus={setStatus}
            dueDate={dueDate}
            setDueDate={setDueDate}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            selectedTags={selectedTags}
            workspaceFolders={workspaceFolders}
            availableTags={availableTags}
            toggleTag={toggleTag}
            onFormatText={formatText}
            onNewFolder={() => setIsNewFolderDialogOpen(true)}
            onNewTag={() => setIsNewTagDialogOpen(true)}
          />
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditMode ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
      <NewTagDialog 
        open={isNewTagDialogOpen} 
        onOpenChange={setIsNewTagDialogOpen}
        onCreateTag={createNewTag}
      />
      
      <NewFolderDialog 
        open={isNewFolderDialogOpen} 
        onOpenChange={setIsNewFolderDialogOpen}
        onCreateFolder={createNewFolder}
      />
    </Dialog>
  );
}

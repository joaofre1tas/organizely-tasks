
import React, { useState, useEffect } from "react";
import { Calendar, Tag, X } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useTask, Priority, Tag as TaskTag, Task, Status } from "@/contexts/TaskContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

export function TaskForm({ open, onClose, task }: TaskFormProps) {
  const { currentWorkspace } = useWorkspace();
  const { addTask, updateTask, folders } = useTask();
  const { toast } = useToast();
  
  const isEditMode = !!task;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<TaskTag[]>([]);
  const [status, setStatus] = useState<Status>("todo");
  
  const availableTags: TaskTag[] = [
    { id: "1", name: "Trabalho", color: "#4c6ef5" },
    { id: "2", name: "Urgente", color: "#fa5252" },
    { id: "3", name: "Reunião", color: "#82c91e" },
    { id: "4", name: "Projeto", color: "#be4bdb" },
    { id: "5", name: "Família", color: "#ff922b" },
  ];
  
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
  }, [task, open]);
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate(null);
    setSelectedFolder(null);
    setSelectedTags([]);
    setStatus("todo");
  };
  
  const handleSubmit = (e: React.FormEvent) => {
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
        updateTask(task.id, {
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
        addTask({
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
  
  const handleCancel = () => {
    resetForm();
    onClose();
  };
  
  const toggleTag = (tag: TaskTag) => {
    const exists = selectedTags.some(t => t.id === tag.id);
    
    if (exists) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const workspaceFolders = folders.filter(
    folder => currentWorkspace && folder.workspaceId === currentWorkspace.id
  );
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar tarefa" : "Nova tarefa"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              placeholder="Título da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Textarea
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <Select 
                value={priority} 
                onValueChange={(value) => setPriority(value as Priority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={status} 
                onValueChange={(value) => setStatus(value as Status)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">A Fazer</SelectItem>
                  <SelectItem value="in-progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pasta</label>
              <Select 
                value={selectedFolder || "none"} 
                onValueChange={(value) => setSelectedFolder(value === "none" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma pasta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem pasta</SelectItem>
                  {workspaceFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de vencimento</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, "PPP", { locale: pt })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate || undefined}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.some(t => t.id === tag.id);
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? "default" : "outline"}
                    style={{ 
                      backgroundColor: isSelected ? `${tag.color}20` : "transparent", 
                      color: tag.color, 
                      borderColor: `${tag.color}40` 
                    }}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag.name}
                  </Badge>
                );
              })}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditMode ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

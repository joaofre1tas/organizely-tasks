
import React, { useState, useEffect } from "react";
import { Calendar, Tag, X, PlusCircle, Folder } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useTask, Priority, Tag as TaskTag, Task, Status } from "@/contexts/TaskContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import { Textarea } from "@/components/ui/textarea";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

interface NewTag {
  name: string;
  color: string;
}

interface NewFolder {
  name: string;
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
  
  // Estado para diálogos de criação
  const [isNewTagDialogOpen, setIsNewTagDialogOpen] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState<NewTag>({ name: "", color: "#4c6ef5" });
  const [newFolder, setNewFolder] = useState<NewFolder>({ name: "" });
  
  // Estado para todas as tags disponíveis
  const [availableTags, setAvailableTags] = useState<TaskTag[]>([]);
  
  useEffect(() => {
    // Carregar todas as tags
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
  
  const createNewTag = () => {
    if (!newTag.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da tag é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const createdTag = addTag({
        name: newTag.name,
        color: newTag.color
      });
      
      setAvailableTags([...availableTags, createdTag]);
      setSelectedTags([...selectedTags, createdTag]);
      setNewTag({ name: "", color: "#4c6ef5" });
      setIsNewTagDialogOpen(false);
      
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
  
  const createNewFolder = () => {
    if (!newFolder.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da pasta é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
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
        name: newFolder.name,
        workspaceId: currentWorkspace.id,
        color: "#808080",
        icon: "folder"
      });
      
      setSelectedFolder(createdFolder.id);
      setNewFolder({ name: "" });
      setIsNewFolderDialogOpen(false);
      
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
  
  const workspaceFolders = folders.filter(
    folder => currentWorkspace && folder.workspaceId === currentWorkspace.id
  );
  
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
    
    // Focus back on textarea after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
  };
  
  return (
    <>
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
              <div className="flex gap-1 mb-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={() => formatText('bold')}
                >
                  B
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 text-xs italic"
                  onClick={() => formatText('italic')}
                >
                  I
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 text-xs underline"
                  onClick={() => formatText('underline')}
                >
                  U
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={() => formatText('bullet')}
                >
                  •
                </Button>
              </div>
              <Textarea
                id="task-description"
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
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Pasta</label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2"
                    onClick={() => setIsNewFolderDialogOpen(true)}
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Nova</span>
                  </Button>
                </div>
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
                  <PopoverContent className="w-auto p-0" align="start">
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
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Tags</label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2"
                  onClick={() => setIsNewTagDialogOpen(true)}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Nova</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.some(t => t.id === tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      variant={isSelected ? "default" : "outline"}
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
      
      {/* Diálogo para criar nova tag */}
      <Dialog open={isNewTagDialogOpen} onOpenChange={setIsNewTagDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Nova tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                placeholder="Digite o nome da tag"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={newTag.color}
                  onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTagDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createNewTag}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para criar nova pasta */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Nova pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                placeholder="Digite o nome da pasta"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createNewFolder}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

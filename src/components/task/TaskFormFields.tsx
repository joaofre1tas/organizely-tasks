
import React from "react";
import { Calendar, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Priority, Status, Tag } from "@/contexts/TaskContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TextFormattingToolbar } from "./TextFormattingToolbar";

interface Folder {
  id: string;
  name: string;
}

interface TaskFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  priority: Priority;
  setPriority: (value: Priority) => void;
  status: Status;
  setStatus: (value: Status) => void;
  dueDate: Date | null;
  setDueDate: (date: Date | null) => void;
  selectedFolder: string | null;
  setSelectedFolder: (value: string | null) => void;
  selectedTags: Tag[];
  workspaceFolders: Folder[];
  availableTags: Tag[];
  toggleTag: (tag: Tag) => void;
  onFormatText: (command: string) => void;
  onNewFolder: () => void;
  onNewTag: () => void;
}

export function TaskFormFields({
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  status,
  setStatus,
  dueDate,
  setDueDate,
  selectedFolder,
  setSelectedFolder,
  selectedTags,
  workspaceFolders,
  availableTags,
  toggleTag,
  onFormatText,
  onNewFolder,
  onNewTag,
}: TaskFormFieldsProps) {
  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Input
          placeholder="Título da tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>
      
      <div className="space-y-2">
        <TextFormattingToolbar onFormat={onFormatText} />
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
              onClick={onNewFolder}
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
            onClick={onNewTag}
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
    </div>
  );
}

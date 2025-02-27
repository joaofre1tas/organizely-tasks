
import React from "react";
import { format, formatDistance } from "date-fns";
import { pt } from "date-fns/locale";
import { 
  Calendar, 
  CheckCircle, 
  Circle, 
  Clock, 
  MoreHorizontal,
  ListChecks
} from "lucide-react";
import { Task, useTask } from "@/contexts/TaskContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEditTask: () => void;
}

export function TaskCard({ task, onEditTask }: TaskCardProps) {
  const { toggleTaskCompletion, deleteTask } = useTask();
  
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return 'Sem prioridade';
    }
  };

  return (
    <Card className={cn(
      "task-item-hover", 
      task.completed ? "opacity-70" : "",
      "border-l-4 border-gray-300"
    )}>
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-start space-y-0">
        <div className="flex items-start gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-full p-0 text-muted-foreground"
            onClick={() => toggleTaskCompletion(task.id)}
          >
            {task.completed ? 
              <CheckCircle className="h-5 w-5 text-green-500" /> : 
              <Circle className="h-5 w-5" />
            }
          </Button>
          <div>
            <h3 className={cn(
              "text-base font-medium leading-tight",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            {task.folderId && (
              <p className="text-xs text-muted-foreground">
                em Pasta
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEditTask}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleTaskCompletion(task.id)}>
              {task.completed ? "Marcar como pendente" : "Marcar como concluída"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive">
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-4 py-2">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3" 
             dangerouslySetInnerHTML={{ __html: task.description }} />
        )}
        
        <div className="flex flex-wrap gap-1.5 mb-2">
          {task.tags.map(tag => (
            <Badge 
              key={tag.id} 
              variant="outline" 
              className="text-xs py-0"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
        
        {task.subtasks.length > 0 && (
          <div className="flex items-center text-xs text-muted-foreground gap-1 mt-2">
            <ListChecks className="h-3.5 w-3.5" />
            <span>
              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtarefas
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-3 flex justify-between border-t text-xs text-muted-foreground">
        {task.dueDate ? (
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {format(new Date(task.dueDate), "dd/MM/yyyy")}
            </span>
          </div>
        ) : (
          <span>Sem prazo</span>
        )}
        
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {formatDistance(new Date(task.updatedAt), new Date(), { 
              addSuffix: true,
              locale: pt 
            })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

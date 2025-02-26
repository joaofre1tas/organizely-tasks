
import { useState, useEffect } from "react";
import { 
  addDays, 
  format, 
  getDay, 
  isSameDay, 
  startOfMonth, 
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks
} from "date-fns";
import { pt } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { TaskCard } from "@/components/TaskCard";
import { Task, useTask } from "@/contexts/TaskContext";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  onEditTask: (task: Task) => void;
}

type ViewType = "month" | "week" | "day";

export function CalendarView({ onEditTask }: CalendarViewProps) {
  const { tasks } = useTask();
  const [view, setView] = useState<ViewType>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const dates = Array(7).fill(0).map((_, i) => addDays(start, i));
      setWeekDates(dates);
    }
  }, [view, currentDate]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = getTasksForDate(selectedDate);
      setSelectedDateTasks(filtered);
    } else {
      setSelectedDateTasks([]);
    }
  }, [selectedDate, tasks]);

  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  const navigatePrevious = () => {
    if (view === "month") {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
    } else if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
      setSelectedDate(addDays(currentDate, -1));
    }
  };

  const navigateNext = () => {
    if (view === "month") {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
      setSelectedDate(addDays(currentDate, 1));
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between mb-6 items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Calendário</h1>
        <div className="flex items-center gap-2">
          <Select 
            value={view} 
            onValueChange={(value) => setView(value as ViewType)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Selecione a visualização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mensal</SelectItem>
              <SelectItem value="week">Semanal</SelectItem>
              <SelectItem value="day">Diário</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {view === "month" && format(currentDate, "MMMM yyyy", { locale: pt })}
            {view === "week" && `Semana de ${format(weekDates[0], "dd/MM", { locale: pt })} a ${format(weekDates[6], "dd/MM", { locale: pt })}`}
            {view === "day" && format(currentDate, "d 'de' MMMM yyyy", { locale: pt })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {view === "month" && (
            <div>
              <Calendar
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentDate}
                onMonthChange={setCurrentDate}
                className="rounded-md border"
                classNames={{
                  day_today: "bg-primary text-primary-foreground"
                }}
                components={{
                  Day: ({ date, ...props }: any) => {
                    const dateHasTasks = tasks.some(task => 
                      task.dueDate && isSameDay(new Date(task.dueDate), date)
                    );
                    
                    return (
                      <div 
                        {...props}
                        className={`relative ${props.className || ""}`}
                      >
                        {date.getDate()}
                        {dateHasTasks && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </div>
          )}

          {view === "week" && (
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, i) => (
                <div 
                  key={i} 
                  className={`p-2 rounded-md cursor-pointer border ${
                    isSameDay(date, selectedDate || new Date()) ? "bg-primary/10 border-primary" : ""
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="text-center mb-1">
                    <div className="text-xs text-muted-foreground">
                      {format(date, "EEEE", { locale: pt })}
                    </div>
                    <div className={`text-lg font-medium ${
                      isSameDay(date, new Date()) ? "text-primary" : ""
                    }`}>
                      {format(date, "d", { locale: pt })}
                    </div>
                  </div>
                  <div className="text-xs text-center">
                    {getTasksForDate(date).length > 0 ? (
                      `${getTasksForDate(date).length} tarefa${getTasksForDate(date).length !== 1 ? 's' : ''}`
                    ) : (
                      <span className="text-muted-foreground">Sem tarefas</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === "day" && (
            <div className="flex flex-col items-center">
              <div className="mb-4 text-center">
                <h3 className="text-lg font-medium">
                  {format(currentDate, "EEEE, d 'de' MMMM", { locale: pt })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getTasksForDate(currentDate).length > 0 
                    ? `${getTasksForDate(currentDate).length} tarefa${getTasksForDate(currentDate).length !== 1 ? 's' : ''}`
                    : "Sem tarefas para hoje"
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">
          {selectedDate 
            ? `Tarefas para ${format(selectedDate, "dd/MM/yyyy")}`
            : "Selecione uma data para ver as tarefas"
          }
        </h2>
        {selectedDateTasks.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {selectedDateTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEditTask={() => onEditTask(task)} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center p-8 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">Não há tarefas para esta data</p>
          </div>
        )}
      </div>
    </div>
  );
}

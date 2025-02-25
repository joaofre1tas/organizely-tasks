
import React, { useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { pt } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, Calendar as CalendarIcon, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useTask } from "@/contexts/TaskContext";
import { Task } from "@/contexts/TaskContext";
import { TaskCard } from "./TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CalendarViewProps {
  onEditTask: (task: Task) => void;
}

export function CalendarView({ onEditTask }: CalendarViewProps) {
  const { tasks } = useTask();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Filter tasks for the selected date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  // Navigation functions
  const next = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prev = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const today = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Generate dates for week view
  const weekDates = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }), // Start on Monday
    end: endOfWeek(currentDate, { weekStartsOn: 1 })
  });

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Calendário</h1>
          <p className="text-muted-foreground">
            Visualize suas tarefas por data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "month" | "week" | "day")}>
            <TabsList>
              <TabsTrigger value="month">Mensal</TabsTrigger>
              <TabsTrigger value="week">Semanal</TabsTrigger>
              <TabsTrigger value="day">Diário</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="p-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={next}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={today}>
              Hoje
            </Button>
          </div>
          <CardTitle className="text-base font-medium">
            {view === "month" && format(currentDate, "MMMM yyyy", { locale: pt })}
            {view === "week" && `Semana de ${format(weekDates[0], "d", { locale: pt })} a ${format(weekDates[6], "d 'de' MMMM yyyy", { locale: pt })}`}
            {view === "day" && format(currentDate, "EEEE, d 'de' MMMM yyyy", { locale: pt })}
          </CardTitle>
          <div></div>
        </CardHeader>
        <CardContent className="p-4">
          {view === "month" && (
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentDate}
                onMonthChange={setCurrentDate}
                className="rounded-md border"
                classNames={{
                  day_today: "bg-primary text-primary-foreground"
                }}
                components={{
                  day: ({ date, ...props }) => {
                    const dateHasTasks = tasks.some(task => 
                      task.dueDate && isSameDay(new Date(task.dueDate), date)
                    );
                    
                    return (
                      <div 
                        {...props}
                        className={`relative ${props.className}`}
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
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
            <h3 className="text-lg font-medium">Sem tarefas para esta data</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Selecione outra data ou adicione novas tarefas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

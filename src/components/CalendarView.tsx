
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
                on
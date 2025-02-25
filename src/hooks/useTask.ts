
import { useContext } from "react";
import { useTask as useTaskFromContext } from "@/contexts/TaskContext";

// Re-exporte o hook para manter a compatibilidade
export const useTask = useTaskFromContext;

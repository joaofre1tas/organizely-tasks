
import { useContext } from "react";
import { TaskContext } from "../contexts/TaskContext";

// Re-export the hook to maintain compatibility with existing imports
export const useTask = () => useContext(TaskContext);

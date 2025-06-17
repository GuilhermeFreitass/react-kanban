import { createContext, type ReactNode, useEffect, useState } from "react";
import type { Task } from "../entities/Task";

export interface TasksContextData {
  tasks: Task[];
  createTask: (attributes: Omit<Task, "id">) => Promise<void>;
  updateTask: (
    id: string,
    attributes: Partial<Omit<Task, "id">>
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const TasksContext = createContext({} as TasksContextData);

interface TasksContextProviderProps {
  children: ReactNode;
}

const TASKS_STORAGE_KEY = "kanban_tasks";

function getTasksFromStorage(): Task[] {
  const data = localStorage.getItem(TASKS_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveTasksToStorage(tasks: Task[]) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

export const TasksContextProvider: React.FC<TasksContextProviderProps> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>(getTasksFromStorage());

  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const createTask = async (attributes: Omit<Task, "id">) => {
    const newTask: Task = {
      ...attributes,
      id: crypto.randomUUID(),
    };
    setTasks((currentState) => [...currentState, newTask]);
  };

  const updateTask = async (
    id: string,
    attributes: Partial<Omit<Task, "id">>
  ) => {
    setTasks((currentState) => {
      const updatedTasks = [...currentState];
      const taskIndex = updatedTasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        Object.assign(updatedTasks[taskIndex], attributes);
      }
      return updatedTasks;
    });
  };

  const deleteTask = async (id: string) => {
    setTasks((currentState) => currentState.filter((task) => task.id !== id));
  };

  return (
    <TasksContext.Provider
      value={{ tasks, createTask, updateTask, deleteTask }}
    >
      {children}
    </TasksContext.Provider>
  );
};

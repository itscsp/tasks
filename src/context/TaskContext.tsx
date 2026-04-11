import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../lib/api';
import type { Task } from '../lib/taskUtils';

interface Project {
  id: number;
  title: string;
  color?: string;
  description?: string;
}

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  isLoading: boolean;
  fetchTasks: (params?: any) => Promise<void>;
  fetchProjects: () => Promise<void>;
  updateTaskLocally: (id: number, updates: Partial<Task>) => void;
  deleteTaskLocally: (id: number) => void;
  addTaskLocally: (task: Task) => void;
  addProjectLocally: (project: Project) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = useCallback(async (params?: any) => {
    setIsLoading(true);
    try {
      const response = await api.get('/tasks', { params });
      const fetchedTasks = response.data;
      
      setTasks(prev => {
        const updated = [...prev];
        fetchedTasks.forEach((nt: Task) => {
          const idx = updated.findIndex(t => t.id === nt.id);
          if (idx >= 0) {
            updated[idx] = nt;
          } else {
            updated.push(nt);
          }
        });
        return updated;
      });
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  }, []);

  const updateTaskLocally = useCallback((id: number, updates: Partial<Task>) => {
    setTasks(prev => {
      const updateRecursive = (list: Task[]): Task[] => {
        return list.map(t => {
          if (t.id === id) return { ...t, ...updates };
          if (t.subtasks && t.subtasks.length > 0) {
            return { ...t, subtasks: updateRecursive(t.subtasks) };
          }
          return t;
        });
      };
      return updateRecursive(prev);
    });
  }, []);

  const deleteTaskLocally = useCallback((id: number) => {
    setTasks(prev => {
      const filterRecursive = (list: Task[]): Task[] => {
        return list
          .filter(t => t.id !== id)
          .map(t => ({
            ...t,
            subtasks: t.subtasks ? filterRecursive(t.subtasks) : undefined
          }));
      };
      return filterRecursive(prev);
    });
  }, []);

  const addTaskLocally = useCallback((task: Task) => {
    setTasks(prev => {
      if (task.parent_task_id) {
        const addRecursive = (list: Task[]): Task[] => {
          return list.map(t => {
            if (t.id === task.parent_task_id) {
              return {
                ...t,
                subtasks: [...(t.subtasks || []), task]
              };
            }
            if (t.subtasks) {
              return { ...t, subtasks: addRecursive(t.subtasks) };
            }
            return t;
          });
        };
        return addRecursive(prev);
      }
      return [...prev, task];
    });
  }, []);

  const addProjectLocally = useCallback((project: Project) => {
    setProjects(prev => [...prev, project]);
  }, []);

  return (
    <TaskContext.Provider value={{
      tasks,
      projects,
      isLoading,
      fetchTasks,
      fetchProjects,
      updateTaskLocally,
      deleteTaskLocally,
      addTaskLocally,
      addProjectLocally
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

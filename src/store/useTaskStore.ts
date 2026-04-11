import { create } from 'zustand';
import api from '../lib/api';
import type { Task } from '../lib/taskUtils';

interface Project {
  id: number;
  title: string;
  color?: string;
  description?: string;
}

interface TaskState {
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

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  projects: [],
  isLoading: false,

  fetchTasks: async (params?: any) => {
    set({ isLoading: true });
    try {
      const response = await api.get('/tasks', { params });
      const fetchedTasks = response.data;
      
      set((state) => {
        const updated = [...state.tasks];
        fetchedTasks.forEach((nt: Task) => {
          const idx = updated.findIndex(t => t.id === nt.id);
          if (idx >= 0) {
            updated[idx] = nt;
          } else {
            updated.push(nt);
          }
        });
        return { tasks: updated };
      });
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProjects: async () => {
    try {
      const response = await api.get('/projects');
      set({ projects: response.data });
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  },

  updateTaskLocally: (id: number, updates: Partial<Task>) => {
    set((state) => {
      const updateRecursive = (list: Task[]): Task[] => {
        return list.map(t => {
          if (t.id === id) return { ...t, ...updates };
          if (t.subtasks && t.subtasks.length > 0) {
            return { ...t, subtasks: updateRecursive(t.subtasks) };
          }
          return t;
        });
      };
      return { tasks: updateRecursive(state.tasks) };
    });
  },

  deleteTaskLocally: (id: number) => {
    set((state) => {
      const filterRecursive = (list: Task[]): Task[] => {
        return list
          .filter(t => t.id !== id)
          .map(t => ({
            ...t,
            subtasks: t.subtasks ? filterRecursive(t.subtasks) : undefined
          }));
      };
      return { tasks: filterRecursive(state.tasks) };
    });
  },

  addTaskLocally: (task: Task) => {
    set((state) => {
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
        return { tasks: addRecursive(state.tasks) };
      }
      return { tasks: [...state.tasks, task] };
    });
  },

  addProjectLocally: (project: Project) => {
    set((state) => ({ projects: [...state.projects, project] }));
  },
}));

export interface Attachment {
  id: number;
  url: string;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  notes?: string;
  is_completed: boolean;
  priority: number;
  due_date?: string;
  labels: string[];
  project_id?: string;
  parent_task_id?: number;
  subtasks?: Task[];
  ancestors?: { id: number; title: string }[];
  attachments?: Attachment[];
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval?: number;
  recurrence_end_date?: string;
  completed_occurrences?: string[];
  // For virtual tasks:
  virtual_date?: string;
}

/**
 * Recursively updates a task within a nested tree structure.
 */
export const updateTaskInTree = (tasks: Task[], taskId: number, updates: Partial<Task>): Task[] => {
  return tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, ...updates };
    }
    if (task.subtasks && task.subtasks.length > 0) {
      return { ...task, subtasks: updateTaskInTree(task.subtasks, taskId, updates) };
    }
    return task;
  });
};

/**
 * Finds a task in a nested tree by its ID.
 */
export const findTaskInTree = (tasks: Task[], taskId: number): Task | undefined => {
  for (const task of tasks) {
    if (task.id === taskId) return task;
    if (task.subtasks) {
      const found = findTaskInTree(task.subtasks, taskId);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * Groups a flat list of tasks into a hierarchical tree based on parent_task_id.
 */
export const buildTaskTree = (flatTasks: Task[]): Task[] => {
  const taskMap = new Map<number, Task & { subtasks: Task[] }>();
  const roots: (Task & { subtasks: Task[] })[] = [];

  // Create a map of tasks for easy lookup
  flatTasks.forEach(task => {
    taskMap.set(task.id, { ...task, subtasks: task.subtasks || [] });
  });

  // Build the tree
  flatTasks.forEach(task => {
    const taskWithChildren = taskMap.get(task.id)!;
    if (task.parent_task_id && taskMap.has(task.parent_task_id)) {
      const parent = taskMap.get(task.parent_task_id)!;
      // Avoid duplicate subtasks if API already nested some
      if (!parent.subtasks.find(s => s.id === task.id)) {
        parent.subtasks.push(taskWithChildren);
      }
    } else {
      // Only add to roots if it hasn't been added yet (via nesting)
      roots.push(taskWithChildren);
    }
  });

  return roots;
};

import { addDays, addWeeks, addMonths, addYears, parseISO, isBefore, isAfter, format, isValid } from 'date-fns';

/**
 * Expands a list of tasks (including recurring ones) into a list of virtual tasks for a given date range.
 */
export const generateVirtualTasks = (tasks: Task[], startDate: Date, endDate: Date): Task[] => {
  const virtualTasks: Task[] = [];

  const expandTask = (task: Task) => {
    // If it's not a recurring task, just include it once if it has no due date or its due date falls in range
    // But usually for a calendar, we just include it if it matches the date or if we are just listing them.
    // For simplicity, we just add non-recurring tasks as is.
    if (!task.recurrence_type || task.recurrence_type === 'none') {
      virtualTasks.push(task);
      return;
    }

    if (!task.due_date) {
      virtualTasks.push(task);
      return;
    }

    const baseDate = parseISO(task.due_date);
    if (!isValid(baseDate)) {
      virtualTasks.push(task);
      return;
    }

    // Generate occurrences until endDate
    let currentDate = baseDate;
    const interval = task.recurrence_interval && task.recurrence_interval > 0 ? task.recurrence_interval : 1;
    let safeguard = 0; // Prevent infinite loops

    const taskEndDate = task.recurrence_end_date ? parseISO(task.recurrence_end_date) : null;
    const effectiveEndDate = taskEndDate && isValid(taskEndDate) && isBefore(taskEndDate, endDate) ? taskEndDate : endDate;

    while (!isAfter(currentDate, effectiveEndDate) && safeguard < 365 * 5) {
      safeguard++;

      if (!isBefore(currentDate, startDate)) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const isCompleted = task.completed_occurrences?.includes(dateStr) || false;
        
        virtualTasks.push({
          ...task,
          virtual_date: dateStr,
          is_completed: isCompleted,
          // We override the due_date for the virtual display so UI components sort/show it correctly
          due_date: dateStr,
        });
      }

      switch (task.recurrence_type) {
        case 'daily':
          currentDate = addDays(currentDate, interval);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, interval);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, interval);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, interval);
          break;
        default:
          // Should not happen, break loop
          currentDate = addDays(endDate, 1);
          break;
      }
    }
  };

  tasks.forEach(task => {
    expandTask(task);
  });

  return virtualTasks;
};

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

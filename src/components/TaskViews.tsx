import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon, 
  Tag, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Loader2
} from 'lucide-react';
import classNames from 'classnames';
import api from '../lib/api';
import { AddTaskForm } from './AddTaskForm';
import type { AddedTaskData } from './AddTaskForm';
import { TaskItem } from './TaskItem';
import { 
  buildTaskTree, 
  updateTaskInTree 
} from '../lib/taskUtils';
import type { Task } from '../lib/taskUtils';

// Unified TaskItem is now in its own file

const ViewTaskForm = ({ onCancel, onSave, defaultDueDate }: { onCancel: () => void, onSave: (task: any) => void, defaultDueDate?: string }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: AddedTaskData) => {
    setIsSaving(true);
    try {
      const response = await api.post('/tasks', {
        title: data.title,
        notes: data.description,
        due_date: data.dueDate || defaultDueDate || undefined,
        priority: 4,
        is_completed: false
      });
      onSave(response.data);
    } catch (err) {
      console.error('Failed to save task', err);
    } finally {
      setIsSaving(false);
    }
  };

  return <AddTaskForm onCancel={onCancel} onSave={handleSave} isSaving={isSaving} />;
};

export const Inbox = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(buildTaskTree(response.data));
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const handleRefresh = () => fetchTasks();
    window.addEventListener('task-added', handleRefresh);
    return () => window.removeEventListener('task-added', handleRefresh);
  }, []);

  const handleToggle = async (id: number) => {
    // We search the tree for the task to get its current status
    const findTask = (list: Task[], targetId: number): Task | undefined => {
      for (const t of list) {
        if (t.id === targetId) return t;
        if (t.subtasks) {
          const found = findTask(t.subtasks, targetId);
          if (found) return found;
        }
      }
      return undefined;
    };

    const task = findTask(tasks, id);
    if (!task) return;

    // Optimistic update using recursive update utility
    const nextStatus = !task.is_completed;
    setTasks(updateTaskInTree(tasks, id, { is_completed: nextStatus }));

    try {
      await api.put(`/tasks/${id}`, { is_completed: nextStatus });
    } catch (err) {
      console.error('Failed to update task', err);
      // Rollback
      setTasks(updateTaskInTree(tasks, id, { is_completed: !nextStatus }));
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-white mb-2">Inbox</h1>
        <p className="text-gray-500 text-[13px]">Uncategorized and new tasks</p>
      </div>

      <div className="space-y-1">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={handleToggle} />
        ))}
      </div>

      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="mt-4 flex items-center space-x-2 text-[#db4c3f] hover:text-[#c53727] text-[14px] font-medium transition-colors p-2 -ml-2 rounded-md hover:bg-[#282828]"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add task</span>
        </button>
      ) : (
        <ViewTaskForm onCancel={() => setIsAdding(false)} onSave={(newTask) => {
          setTasks([...tasks, newTask]);
          setIsAdding(false);
        }} />
      )}
    </div>
  );
};

export const Today = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks', { params: { due_date: 'today' } });
      setTasks(buildTaskTree(response.data));
    } catch (err) {
      console.error('Failed to fetch today tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const handleRefresh = () => fetchTasks();
    window.addEventListener('task-added', handleRefresh);
    return () => window.removeEventListener('task-added', handleRefresh);
  }, []);

  const handleToggle = async (id: number) => {
    const task = findTaskInTree(tasks, id);
    if (!task) return;
    const nextStatus = !task.is_completed;
    setTasks(updateTaskInTree(tasks, id, { is_completed: nextStatus }));
    try {
      await api.put(`/tasks/${id}`, { is_completed: nextStatus });
    } catch (err) {
      setTasks(updateTaskInTree(tasks, id, { is_completed: !nextStatus }));
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  if (tasks.length === 0 && !isAdding) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 relative">
          <div className="w-32 h-32 bg-[#282828] rounded-full flex items-center justify-center overflow-hidden">
            <div className="w-16 h-16 bg-yellow-400 rounded-full animate-pulse blur-xl opacity-20"></div>
            <svg viewBox="0 0 24 24" className="w-20 h-20 text-yellow-500/80 fill-current">
              <path d="M12,2L14.39,4.04C15.82,5.25 17.61,6.04 19.5,6.33L22,6.72L20.19,8.53C18.82,9.89 18.04,11.68 18.04,13.56V16.1L15.42,15.17C13.51,14.49 11.41,14.49 9.5,15.17L6.88,16.1V13.56C6.88,11.68 6.1,9.89 4.73,8.53L2.92,6.72L5.42,6.33C7.31,6.04 9.1,5.25 10.53,4.04L12,2Z" />
            </svg>
          </div>
        </div>
        <h2 className="text-[18px] font-bold text-gray-200 mb-2">Welcome to your Today view</h2>
        <p className="text-[13px] text-gray-500 max-w-[280px] mb-8 leading-relaxed">
          See everything due today across all your projects.
        </p>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 bg-[#db4c3f] hover:bg-[#c53727] text-white px-4 py-2 rounded-md text-[13px] font-bold transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-white mb-2">Today</h1>
        <p className="text-gray-500 text-[13px]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="space-y-1">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={handleToggle} />
        ))}
      </div>

      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="mt-4 flex items-center space-x-2 text-[#db4c3f] hover:text-[#c53727] text-[14px] font-medium transition-colors p-2 -ml-2 rounded-md hover:bg-[#282828]"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add task</span>
        </button>
      ) : (
        <ViewTaskForm 
          defaultDueDate={new Date().toISOString().split('T')[0]} 
          onCancel={() => setIsAdding(false)} 
          onSave={(newTask) => {
            setTasks([...tasks, newTask]);
            setIsAdding(false);
          }} 
        />
      )}
    </div>
  );
};

export const Upcoming = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingForDate, setIsAddingForDate] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks', { params: { due_date: 'upcoming' } });
      setTasks(buildTaskTree(response.data));
    } catch (err) {
      console.error('Failed to fetch upcoming tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const handleRefresh = () => fetchTasks();
    window.addEventListener('task-added', handleRefresh);
    return () => window.removeEventListener('task-added', handleRefresh);
  }, []);

  const handleToggle = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextStatus = !task.is_completed;
    setTasks(updateTaskInTree(tasks, id, { is_completed: nextStatus }));
    try {
      await api.put(`/tasks/${id}`, { is_completed: nextStatus });
    } catch (err) {
      setTasks(updateTaskInTree(tasks, id, { is_completed: !nextStatus }));
    }
  };

  const getUpcomingDates = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long' });
      const displayDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      dates.push({ date: dateStr, label: `${displayDate} · ${label}` });
    }
    return dates;
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-white mb-1">Upcoming</h1>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-1 text-gray-500 hover:bg-[#282828] rounded-md transition-all"><ChevronLeft className="w-5 h-5" /></button>
          <button className="px-2 py-1 bg-[#282828] border border-[#333] rounded text-[11px] font-bold text-gray-300 hover:text-white transition-all">Today</button>
          <button className="p-1 text-gray-500 hover:bg-[#282828] rounded-md transition-all"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="space-y-12">
        {getUpcomingDates().map((group) => {
          const groupTasks = tasks.filter(t => t.due_date === group.date);
          return (
            <div key={group.date} className="relative">
              <div className="sticky top-0 bg-[#1e1e1e] py-1 border-b border-[#282828] mb-2 z-10">
                <span className="text-[13px] font-bold text-gray-300">{group.label}</span>
              </div>
              <div className="space-y-1 pl-1">
                {groupTasks.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={handleToggle} />
                ))}
                
                {isAddingForDate === group.date ? (
                  <ViewTaskForm 
                    defaultDueDate={group.date}
                    onCancel={() => setIsAddingForDate(null)}
                    onSave={(newTask) => {
                      setTasks([...tasks, newTask]);
                      setIsAddingForDate(null);
                    }}
                  />
                ) : (
                  <button 
                    onClick={() => setIsAddingForDate(group.date)}
                    className="mt-3 flex items-center space-x-2 text-[#db4c3f] hover:text-[#c53727] text-[13px] font-medium transition-colors p-1 -ml-1 rounded-md hover:bg-[#282828]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add task</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

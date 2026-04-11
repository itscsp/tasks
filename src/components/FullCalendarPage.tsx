import { useState, useEffect } from 'react';
import { 
  format, 
  parseISO, 
  isToday, 
  isTomorrow,
  isYesterday,
} from 'date-fns';
import { 
  Loader2,
  Calendar as CalendarIcon,
  List,
  Plus
} from 'lucide-react';
import api from '../lib/api';
import { TaskItem } from './TaskItem';
import { buildTaskTree, findTaskInTree } from '../lib/taskUtils';
import { useTaskStore } from '../store/useTaskStore';
import { CalendarView } from './CalendarView';
import { TaskDetailModal } from './TaskDetailModal';
import { AddTaskForm } from './AddTaskForm';
import type { AddedTaskData } from './AddTaskForm';

// Modal task form component
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

export const FullCalendarPage = () => {
  const { tasks: allTasks, fetchTasks, updateTaskLocally, addTaskLocally } = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingForDate, setIsAddingForDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchTasks({});
      setIsLoading(false);
    };
    load();
  }, [fetchTasks]);

  const handleToggle = async (id: number) => {
    const task = findTaskInTree(allTasks, id);
    if (!task) return;
    const nextStatus = !task.is_completed;
    updateTaskLocally(id, { is_completed: nextStatus });
    try {
      await api.put(`/tasks/${id}`, { is_completed: nextStatus });
    } catch (err) {
      updateTaskLocally(id, { is_completed: !nextStatus });
    }
  };

  const getGroupedTasks = () => {
    const groups: Record<string, { label: string, tasks: any[] }> = {};
    
    // Sort tasks by due date
    const tasksWithDate = allTasks.filter(t => t.due_date && !t.parent_task_id);
    
    tasksWithDate.forEach(task => {
      const dateStr = task.due_date!;
      if (!groups[dateStr]) {
        const d = parseISO(dateStr);
        let label = format(d, 'd MMM yyyy');
        if (isToday(d)) label += ' · Today · ' + format(d, 'EEEE');
        else if (isTomorrow(d)) label += ' · Tomorrow · ' + format(d, 'EEEE');
        else if (isYesterday(d)) label += ' · Yesterday · ' + format(d, 'EEEE');
        else label += ' · ' + format(d, 'EEEE');
        
        groups[dateStr] = { label, tasks: [] };
      }
      groups[dateStr].tasks.push(task);
    });

    return Object.entries(groups).sort(([dateA], [dateB]) => dateA.localeCompare(dateB));
  };

  if (isLoading && allTasks.length === 0) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  const groupedTasks = getGroupedTasks();

  return (
    <div className="w-full max-w-[800px] mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-white mb-2">Calendar</h1>
          <p className="text-gray-500 text-[13px]">All tasks scheduled across past, present, and future.</p>
        </div>
        <div className="flex items-center bg-[#282828] rounded-lg p-1 border border-[#333]">
          <button 
             onClick={() => setViewMode('calendar')}
             className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
          <button 
             onClick={() => setViewMode('list')}
             className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView 
          tasks={allTasks} 
          onAddTask={(date) => setIsAddingForDate(date)} 
          onTaskClick={(task) => setSelectedTask(task)}
        />
      ) : (
        <div className="space-y-10 mt-8">
          {groupedTasks.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-[14px]">No scheduled tasks found.</p>
            </div>
          ) : (
            groupedTasks.map(([dateStr, group]) => (
              <div key={dateStr} className="relative">
                <div className="py-2 border-b border-[#282828] mb-4">
                  <span className="text-[14px] font-bold text-gray-300">{group.label}</span>
                </div>
                <div className="space-y-1 pl-1">
                  {group.tasks.map((task: any) => {
                    const taskTree = buildTaskTree([task, ...allTasks.filter(t => t.parent_task_id === task.id)]);
                    return <TaskItem key={task.id} task={taskTree[0]} onToggle={handleToggle} />;
                  })}
                  
                  {isAddingForDate === dateStr ? (
                    <ViewTaskForm 
                      defaultDueDate={dateStr}
                      onCancel={() => setIsAddingForDate(null)}
                      onSave={(newTask) => {
                        addTaskLocally(newTask);
                        setIsAddingForDate(null);
                      }}
                    />
                  ) : (
                    <button 
                      onClick={() => setIsAddingForDate(dateStr)}
                      className="mt-3 flex items-center space-x-2 text-gray-500 hover:text-[#db4c3f] text-[13px] font-medium transition-colors p-1 -ml-1 rounded-md group"
                    >
                      <Plus className="w-4 h-4 text-[#db4c3f] group-hover:scale-110 transition-transform" />
                      <span>Add task</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isAddingForDate && viewMode === 'calendar' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#1e1e1e] rounded-xl border border-[#333] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add task for {isAddingForDate}</h3>
            <ViewTaskForm 
              defaultDueDate={isAddingForDate}
              onCancel={() => setIsAddingForDate(null)}
              onSave={(newTask) => {
                addTaskLocally(newTask);
                setIsAddingForDate(null);
              }}
            />
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal 
          onClose={() => setSelectedTask(null)} 
          taskId={selectedTask.id} 
          onTaskUpdated={() => {}}
        />
      )}
    </div>
  );
};

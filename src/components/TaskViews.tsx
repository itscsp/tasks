import { useState, useEffect } from 'react';
import { 
  format, 
  addDays, 
  startOfDay, 
  isBefore, 
  parseISO, 
  isToday, 
  isTomorrow,
  subDays,
  isSameDay
} from 'date-fns';
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Calendar as CalendarIcon,
  List,
  ChevronDown
} from 'lucide-react';
import api from '../lib/api';
import { AddTaskForm } from './AddTaskForm';
import type { AddedTaskData } from './AddTaskForm';
import { TaskItem } from './TaskItem';
import { 
  buildTaskTree,
  findTaskInTree 
} from '../lib/taskUtils';
import { useTaskStore } from '../store/useTaskStore';
import { CalendarView } from './CalendarView';
import { TaskDetailModal } from './TaskDetailModal';

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
  const { tasks: allTasks, fetchTasks, updateTaskLocally, addTaskLocally } = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Filter inbox tasks and build tree
  // Handle project_id being '', '0', null, or undefined
  const tasks = buildTaskTree(allTasks.filter(t => 
    (!t.project_id || t.project_id === '' || t.project_id === '0') && 
    !t.parent_task_id
  ));

  const fetchData = async () => {
    setIsLoading(true);
    await fetchTasks({});
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (id: number) => {
    const task = findTaskInTree(tasks, id);
    if (!task) return;
    const nextStatus = !task.is_completed;
    updateTaskLocally(id, { is_completed: nextStatus });
    try {
      await api.put(`/tasks/${id}`, { is_completed: nextStatus });
    } catch (err) {
      updateTaskLocally(id, { is_completed: !nextStatus });
    }
  };

  if (isLoading && tasks.length === 0) {
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
          addTaskLocally(newTask);
          setIsAdding(false);
        }} />
      )}
    </div>
  );
};

export const Today = () => {
  const { tasks: allTasks, fetchTasks, updateTaskLocally, addTaskLocally } = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tasks = buildTaskTree(allTasks.filter(t => t.due_date === todayStr && !t.parent_task_id));

  const fetchData = async () => {
    setIsLoading(true);
    await fetchTasks({});
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (id: number) => {
    const task = findTaskInTree(tasks, id);
    if (!task) return;
    const nextStatus = !task.is_completed;
    updateTaskLocally(id, { is_completed: nextStatus });
    try {
      await api.put(`/tasks/${id}`, { is_completed: nextStatus });
    } catch (err) {
      updateTaskLocally(id, { is_completed: !nextStatus });
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
            addTaskLocally(newTask);
            setIsAdding(false);
          }} 
        />
      )}
    </div>
  );
};

export const Upcoming = () => {
  const { tasks: allTasks, fetchTasks, updateTaskLocally, addTaskLocally } = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingForDate, setIsAddingForDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isOverdueExpanded, setIsOverdueExpanded] = useState(true);
  const [baseDate, setBaseDate] = useState(new Date());

  const fetchData = async () => {
    setIsLoading(true);
    await fetchTasks({});
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const getSliderDates = () => {
    const dates = [];
    // Show 7 days starting from baseDate - 3
    const start = subDays(baseDate, 3);
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(start, i));
    }
    return dates;
  };

  const overdueTasks = allTasks.filter(t => {
    if (!t.due_date || t.is_completed) return false;
    return isBefore(parseISO(t.due_date), startOfDay(new Date()));
  });

  const getUpcomingGroups = () => {
    const groups: { date: string, label: string }[] = [];
    const today = startOfDay(new Date());
    
    // 1. Ensure at least the next 7 days are included
    for (let i = 0; i < 7; i++) {
      const d = addDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      let label = format(d, 'd MMM');
      if (isToday(d)) label += ' · Today · ' + format(d, 'EEEE');
      else if (isTomorrow(d)) label += ' · Tomorrow · ' + format(d, 'EEEE');
      else label += ' · ' + format(d, 'EEEE');
      groups.push({ date: dateStr, label });
    }

    // 2. Add any other future dates that have tasks
    allTasks.forEach(task => {
      if (task.due_date && !task.is_completed) {
        const taskDate = parseISO(task.due_date);
        if (!isBefore(taskDate, today)) {
          const dateStr = format(taskDate, 'yyyy-MM-dd');
          if (!groups.find(g => g.date === dateStr)) {
            groups.push({
              date: dateStr,
              label: format(taskDate, 'd MMM · EEEE')
            });
          }
        }
      }
    });

    // 3. Sort groups by date
    return groups.sort((a, b) => a.date.localeCompare(b.date));
  };

  if (isLoading && allTasks.length === 0) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[800px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[24px] font-bold text-white">Upcoming</h1>
          <div className="flex items-center bg-[#282828] rounded-lg p-1 border border-[#333]">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === 'list' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button className="flex items-center space-x-1 text-[15px] font-bold text-white hover:bg-[#282828] px-2 py-1 rounded-md transition-all">
                <span>{format(baseDate, 'MMMM yyyy')}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              <div className="flex items-center bg-[#282828]/50 border border-[#333] rounded-lg overflow-hidden">
                <button onClick={() => setBaseDate(subDays(baseDate, 7))} className="p-1 px-2 hover:bg-[#333] border-r border-[#333] transition-all text-gray-500 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setBaseDate(new Date())} className="px-3 py-1 text-[11px] font-bold text-gray-300 hover:text-white transition-all border-r border-[#333]">Today</button>
                <button onClick={() => setBaseDate(addDays(baseDate, 7))} className="p-1 px-2 hover:bg-[#333] transition-all text-gray-500 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 border-b border-[#282828] pb-4 mb-8">
              {getSliderDates().map((d) => (
                <div key={d.toString()} className="flex flex-col items-center group cursor-pointer" onClick={() => setBaseDate(d)}>
                  <span className="text-[11px] font-medium text-gray-500 mb-1 group-hover:text-gray-300">{format(d, 'EEE')}</span>
                  <div className={`
                    w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-bold transition-all
                    ${isToday(d) ? 'bg-[#db4c3f] text-white shadow-lg' : isSameDay(d, baseDate) ? 'bg-[#333] text-white' : 'text-gray-400 group-hover:bg-[#282828]'}
                  `}>
                    {format(d, 'd')}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView 
          tasks={allTasks} 
          onAddTask={(date) => setIsAddingForDate(date)} 
          onTaskClick={(task) => setSelectedTask(task)}
        />
      ) : (
        <div className="space-y-4">
          {overdueTasks.length > 0 && (
            <div className="mb-8 group/overdue">
              <div 
                className="flex items-center justify-between py-2 border-b border-[#282828] cursor-pointer"
                onClick={() => setIsOverdueExpanded(!isOverdueExpanded)}
              >
                <div className="flex items-center space-x-2">
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isOverdueExpanded ? 'rotate-90' : ''}`} />
                  <span className="text-[14px] font-bold text-white">Overdue</span>
                </div>
                <button className="text-[12px] font-bold text-[#db4c3f] hover:text-[#c53727] opacity-0 group-hover/overdue:opacity-100 transition-all">Reschedule</button>
              </div>
              {isOverdueExpanded && (
                <div className="mt-2 space-y-1">
                  {overdueTasks.map(task => (
                    <TaskItem key={task.id} task={task} onToggle={handleToggle} />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-10">
            {getUpcomingGroups().map((group) => {
              const groupTasks = allTasks.filter(t => t.due_date === group.date && !t.parent_task_id);
              return (
                <div key={group.date} className="relative">
                  <div className="py-2 border-b border-[#282828] mb-4">
                    <span className="text-[14px] font-bold text-gray-300">{group.label}</span>
                  </div>
                  <div className="space-y-1 pl-1">
                    {groupTasks.map((task: any) => {
                      const taskTree = buildTaskTree([task, ...allTasks.filter(t => t.parent_task_id === task.id)]);
                      return <TaskItem key={task.id} task={taskTree[0]} onToggle={handleToggle} />;
                    })}
                    
                    {isAddingForDate === group.date ? (
                      <ViewTaskForm 
                        defaultDueDate={group.date}
                        onCancel={() => setIsAddingForDate(null)}
                        onSave={(newTask) => {
                          addTaskLocally(newTask);
                          setIsAddingForDate(null);
                        }}
                      />
                    ) : (
                      <button 
                        onClick={() => setIsAddingForDate(group.date)}
                        className="mt-3 flex items-center space-x-2 text-gray-500 hover:text-[#db4c3f] text-[13px] font-medium transition-colors p-1 -ml-1 rounded-md group"
                      >
                        <Plus className="w-4 h-4 text-[#db4c3f] group-hover:scale-110 transition-transform" />
                        <span>Add task</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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



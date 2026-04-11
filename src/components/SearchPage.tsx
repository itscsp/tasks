import { useState, useEffect } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { useTaskStore } from '../store/useTaskStore';
import { TaskDetailModal } from './TaskDetailModal';
import { buildTaskTree, findTaskInTree } from '../lib/taskUtils';
import api from '../lib/api';

export const SearchPage = () => {
  const { tasks: allTasks, fetchTasks, updateTaskLocally } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

  const getFilteredTasks = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    
    return allTasks.filter(t => 
      t.title.toLowerCase().includes(query) ||
      (t.notes && t.notes.toLowerCase().includes(query)) ||
      (t.labels && t.labels.some(l => l.toLowerCase().includes(query)))
    );
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="w-full max-w-[800px] mx-auto pb-32">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-white mb-2">Search</h1>
        
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-500" />
          </div>
          <input
            autoFocus
            type="text"
            className="w-full bg-[#282828] border border-[#333] text-white text-sm rounded-lg focus:ring-[#db4c3f] focus:border-[#db4c3f] block pl-10 p-2.5 outline-none transition-all"
            placeholder="Search tasks, descriptions, or labels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="w-full py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-1 mt-6">
          {searchQuery.trim() === '' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <SearchIcon className="w-12 h-12 text-gray-500 mb-4" />
              <p className="text-gray-400 text-sm">Type to start searching across all your tasks</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task: any) => {
              const taskTree = buildTaskTree([task, ...allTasks.filter(t => t.parent_task_id === task.id)]);
              return <TaskItem key={task.id} task={taskTree[0]} onToggle={handleToggle} />;
            })
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-[14px]">No results found for "{searchQuery}"</p>
            </div>
          )}
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

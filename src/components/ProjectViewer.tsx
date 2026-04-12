import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { AddTaskForm } from './AddTaskForm';
import type { AddedTaskData } from './AddTaskForm';
import { TaskItem } from './TaskItem';
import { 
  buildTaskTree, 
  findTaskInTree
} from '../lib/taskUtils';
import { useTaskStore } from '../store/useTaskStore';


// Unified TaskItem is now in its own file

const ProjectTaskForm = ({ onCancel, onSave, projectId }: { onCancel: () => void, onSave: (task: any) => void, projectId: string }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: AddedTaskData) => {
    setIsSaving(true);
    try {
      const response = await api.post('/tasks', {
        title: data.title,
        notes: data.description,
        project_id: projectId,
        priority: 4,
        is_completed: false,
        due_date: data.dueDate || undefined
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

export const ProjectViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks: allTasks, projects, fetchTasks, updateTaskLocally, addTaskLocally, updateProjectLocally } = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const project = projects.find(p => p.id.toString() === id);
  const projectTasks = buildTaskTree(allTasks.filter(t => t.project_id === id && !t.parent_task_id));

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    await fetchTasks({ project_id: id });
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleToggle = async (taskId: number) => {
    const task = findTaskInTree(projectTasks, taskId);
    if (!task) return;

    const nextStatus = !task.is_completed;
    updateTaskLocally(taskId, { is_completed: nextStatus });

    try {
      await api.put(`/tasks/${taskId}`, { is_completed: nextStatus });
    } catch (err) {
      updateTaskLocally(taskId, { is_completed: !nextStatus });
    }
  };

  const handleArchiveProject = async () => {
    if (!project || isArchiving || !window.confirm(`Are you sure you want to archive "${project.title}"?`)) return;
    setIsArchiving(true);
    try {
      await api.put(`/projects/${project.id}`, { is_archived: true });
      updateProjectLocally(project.id, { is_archived: true });
      navigate('/archive'); // send them to archive page
    } catch (err) {
      console.error('Failed to archive project', err);
      setIsArchiving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="w-full pb-32">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-1.5 mb-2">
              <span className="text-[14px] text-gray-500 font-medium">My Projects</span>
              <span className="text-[14px] text-gray-500 font-medium">/</span>
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-tight">{project.title}</h1>
          {project.description && (
            <p className="text-gray-500 text-[13px] mt-2">{project.description}</p>
          )}
        </div>
        <div>
          <button 
            disabled={isArchiving}
            onClick={handleArchiveProject}
            className="px-4 py-2 border border-[#444] text-gray-300 bg-[#2d2d2d] hover:bg-[#363636] hover:text-white rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50"
          >
            {isArchiving ? 'Archiving...' : 'Archive Project'}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {projectTasks.map(task => (
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
        <ProjectTaskForm 
          projectId={id!} 
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

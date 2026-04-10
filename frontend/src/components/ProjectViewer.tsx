import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Circle, MoreHorizontal, Plus, Calendar as CalendarIcon, Tag, Loader2 } from 'lucide-react';
import classNames from 'classnames';
import api from '../lib/api';
import { AddTaskForm } from './AddTaskForm';
import type { AddedTaskData } from './AddTaskForm';

interface Task {
  id: number;
  title: string;
  notes?: string;
  is_completed: boolean;
  priority: number;
  due_date?: string;
  labels: string[];
  subtasks?: Task[];
}

interface Project {
  id: number;
  title: string;
  description?: string;
}

const TaskItem = ({ task, onToggle, isSubtask = false }: { task: Task, onToggle: (id: number) => void, isSubtask?: boolean }) => {
  return (
    <div 
      onClick={() => window.dispatchEvent(new CustomEvent('open-task-detail', { detail: task.id }))}
      className={classNames("group py-2 transition-all border-b border-transparent hover:border-[#333] animate-in fade-in duration-300 cursor-pointer", { "pl-8": isSubtask })}
    >
      <div className="flex items-start">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className="mt-1 text-gray-500 hover:text-white mr-3 flex-shrink-0 transition-colors"
        >
          {task.is_completed ? (
            <CheckCircle2 className={isSubtask ? "w-4 h-4 text-blue-500" : "w-5 h-5 text-blue-500"} />
          ) : (
            <Circle className={isSubtask ? "w-4 h-4" : "w-5 h-5"} />
          )}
        </button>
        
        <div className="flex-1 flex flex-col pt-0.5">
          <div className="flex items-center justify-between">
            <span className={classNames("text-[14px] transition-all", { 
              "text-gray-500 line-through": task.is_completed, 
              "text-gray-200 font-medium": !task.is_completed && !isSubtask,
              "text-gray-300": isSubtask
            })}>
              {task.title}
            </span>
          </div>

          {!task.is_completed && !isSubtask && (
            <div className="flex items-center space-x-3 mt-1.5">
              {task.due_date && (
                <div className="flex items-center text-[11px] space-x-1 text-red-400 font-medium">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{task.due_date}</span>
                </div>
              )}
              {task.labels && task.labels.map((label: string) => (
                <div key={label} className="flex items-center text-[11px] space-x-1 text-gray-500">
                  <Tag className="w-3 h-3" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}

          {task.subtasks && task.subtasks.map((sub: Task) => (
            <TaskItem key={sub.id} task={sub} onToggle={onToggle} isSubtask={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [projectRes, tasksRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get('/tasks', { params: { project_id: id } })
        ]);
        setProject(projectRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error('Failed to fetch project data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleToggle = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const nextStatus = !task.is_completed;
    setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: nextStatus } : t));

    try {
      await api.put(`/tasks/${taskId}`, { is_completed: nextStatus });
    } catch (err) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: task.is_completed } : t));
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
      <div className="mb-8">
        <div className="flex items-center space-x-1.5 mb-2">
            <span className="text-[14px] text-gray-500 font-medium">My Projects</span>
            <span className="text-[14px] text-gray-500 font-medium">/</span>
        </div>
        <h1 className="text-[28px] font-bold text-white tracking-tight">{project.title}</h1>
        {project.description && (
          <p className="text-gray-500 text-[13px] mt-2">{project.description}</p>
        )}
      </div>

      <div className="space-y-1">
        {tasks.map(task => (
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
            setTasks([...tasks, newTask]);
            setIsAdding(false);
          }} 
        />
      )}
    </div>
  );
};

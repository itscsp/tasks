import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Circle, MoreHorizontal, Plus, Calendar as CalendarIcon, Tag, Flag } from 'lucide-react';
import classNames from 'classnames';

// Mock data to match screenshot vibe
const mockTasks = [
  { id: 1, title: 'Design system architecture', is_completed: true, priority: 1 },
  { id: 2, title: 'Setup database schema', is_completed: false, priority: 2, due_date: 'Today', labels: ['backend', 'db'] },
  { id: 3, title: 'Implement authentication', is_completed: false, priority: 1, subtasks: [
      { id: 4, title: 'JWT token generation', is_completed: false },
      { id: 5, title: 'Google OAuth integration', is_completed: false },
      { id: 6, title: 'Roles and permissions verification', is_completed: false }
  ] },
  { id: 7, title: 'Develop frontend components', is_completed: false, priority: 3, subtasks: [
      { id: 8, title: 'Layout sidebar', is_completed: true },
      { id: 9, title: 'Project detailed view', is_completed: false },
  ] },
];

const TaskItem = ({ task, level = 0 }: { task: any, level?: number }) => {
  return (
    <div className={classNames("group flex flex-col py-1.5 border-b border-transparent hover:border-gray-100", { "ml-6": level > 0 })}>
      <div className="flex items-start">
        <button className="mt-0.5 text-gray-300 hover:text-blue-500 mr-3 flex-shrink-0">
          {task.is_completed ? (
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
        
        <div className="flex-1 flex flex-col pt-0.5">
          <div className="flex items-center justify-between">
            <span className={classNames("text-sm font-medium", { "text-gray-400 line-through": task.is_completed, "text-gray-800": !task.is_completed })}>
              {task.title}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2 text-gray-400">
               <button className="hover:text-gray-600"><Plus className="w-4 h-4" /></button>
               <button className="hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
          </div>

          {!task.is_completed && (task.due_date || task.labels) && (
            <div className="flex items-center space-x-3 mt-1.5">
              {task.due_date && (
                <div className="flex items-center text-xs space-x-1 text-red-500 font-medium">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{task.due_date}</span>
                </div>
              )}
              {task.labels && task.labels.map((label: string) => (
                <div key={label} className="flex items-center text-xs space-x-1 text-gray-500">
                  <Tag className="w-3 h-3" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Render subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-2 space-y-1">
          {task.subtasks.map((subtask: any) => (
            <TaskItem key={subtask.id} task={subtask} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ProjectViewer = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState(mockTasks);

  return (
    <div className="w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Development</h1>
        <p className="text-gray-500 text-sm">Building the core infrastructure</p>
      </div>

      <div className="space-y-2">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      <button className="mt-4 flex items-center space-x-2 text-gray-400 hover:text-blue-500 text-sm font-medium transition-colors p-2 rounded-md hover:bg-gray-50">
        <Plus className="w-4 h-4" />
        <span>Add task</span>
      </button>
    </div>
  );
};

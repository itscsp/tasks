import React, { useState } from 'react';
import { CheckCircle2, Circle, Calendar as CalendarIcon, Tag, Plus } from 'lucide-react';
import classNames from 'classnames';

const mockTasks = [
  { id: 10, title: 'Respond to emails', is_completed: false, priority: 2, due_date: 'Today', labels: ['admin'] },
  { id: 11, title: 'Code review for PR #42', is_completed: false, priority: 1, due_date: 'Today', labels: ['dev'] },
];

const SimpleTaskItem = ({ task }: { task: any }) => {
  return (
    <div className="group flex flex-col py-2 border-b border-transparent hover:border-gray-100">
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
    </div>
  );
};

const GenericView = ({ title, subtitle }: { title: string, subtitle: string }) => {
  const [tasks] = useState(mockTasks);

  return (
    <div className="w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <SimpleTaskItem key={task.id} task={task} />
        ))}
      </div>

      <button className="mt-4 flex items-center space-x-2 text-gray-400 hover:text-blue-500 text-sm font-medium transition-colors p-2 rounded-md hover:bg-gray-50">
        <Plus className="w-4 h-4" />
        <span>Add task</span>
      </button>
    </div>
  );
};

export const Inbox = () => <GenericView title="Inbox" subtitle="Uncategorized and new tasks" />;
export const Today = () => <GenericView title="Today" subtitle="Tasks due today across all projects" />;
export const Upcoming = () => <GenericView title="Upcoming" subtitle="Tasks due in the next 7 days" />;

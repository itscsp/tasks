import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  Tag,
  ChevronRight,
  ChevronDown,
  GitBranch
} from 'lucide-react';
import classNames from 'classnames';
import type { Task } from '../lib/taskUtils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  isSubtask?: boolean;
}

export const TaskItem = ({ task, onToggle, isSubtask = false }: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks?.filter(s => s.is_completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div className="flex flex-col">
      <div
        onClick={() => window.dispatchEvent(new CustomEvent('open-task-detail', { detail: task.id }))}
        className={classNames(
          "group py-2 transition-all border-b border-transparent hover:border-[#333] animate-in fade-in duration-300 cursor-pointer",
          { "pl-8": isSubtask }
        )}
      >
        <div className="flex items-start">
          {/* Collapse/Expand Toggle - now aligned left of the circle */}
          <div className="mt-1 w-6 flex items-center justify-center mr-1">
            {hasSubtasks && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-gray-600 hover:text-white transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            className="mt-1 text-gray-500 hover:text-white mr-3 flex-shrink-0 transition-colors"
          >
            {task.is_completed ? (
              <CheckCircle2 className={isSubtask ? "w-4 h-4 text-blue-500 font-bold" : "w-5 h-5 text-blue-500 font-bold"} />
            ) : (
              <Circle className={isSubtask ? "w-4 h-4" : "w-5 h-5"} />
            )}
          </button>

          <div className="flex-1 flex flex-col pt-0.5">
            <div className="flex items-center justify-between">
              <span className={classNames("text-[14px] transition-all", {
                "text-green-500 ": task.is_completed,
                "text-gray-200 font-medium": !task.is_completed && !isSubtask,
                "text-gray-300": isSubtask
              })}>
                {task.title}
              </span>
            </div>

            <div className="flex items-center space-x-3 mt-1.5 flex-wrap gap-y-1">
              {/* Subtask Progress */}
              {hasSubtasks && (
                <div className="flex items-center text-[11px] space-x-1 text-purple-400 font-medium mb-1">
                  <GitBranch className="w-3 h-3" />
                  <span>{completedSubtasks}/{totalSubtasks}</span>
                </div>
              )}

              {!task.is_completed && !isSubtask && (
                <div className="flex items-center space-x-3 mb-1">
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
            </div>
          </div>
        </div>
      </div>

      {/* Recursive Render of Subtasks */}
      {hasSubtasks && isExpanded && (
        <div className="relative">
          {/* Vertical Guide Line */}
          <div className="absolute left-[39px] top-0 bottom-4 w-[1px] bg-[#333]" />

          <div className="flex flex-col">
            {task.subtasks!.map((sub) => (
              <TaskItem key={sub.id} task={sub} onToggle={onToggle} isSubtask={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon, 
  Tag, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import classNames from 'classnames';

const mockTasks = [
  { 
    id: 10, 
    title: 'task 1', 
    is_completed: false, 
    priority: 4, 
    due_date: 'Today', 
    labels: [],
    subtasks: [
      { id: 101, title: 'khkjhkh', is_completed: false }
    ]
  },
  { 
    id: 11, 
    title: 'Respond to emails', 
    is_completed: false, 
    priority: 1, 
    due_date: 'Today', 
    labels: ['admin'],
    subtasks: []
  },
];

const mockUpcomingTasksByDate = [
  { date: '10 Apr · Today · Friday', tasks: [{ id: 20, title: 'Complete chapter 1', is_completed: false }] },
  { date: '11 Apr · Tomorrow · Saturday', tasks: [] },
  { date: '12 Apr · Sunday', tasks: [] },
  { date: '13 Apr · Monday', tasks: [] },
];

const TaskItem = ({ task, isSubtask = false }: { task: any, isSubtask?: boolean }) => {
  return (
    <div className={classNames("group py-2 transition-all border-b border-transparent hover:border-[#333]", { "pl-8": isSubtask })}>
      <div className="flex items-start">
        <button className="mt-1 text-gray-500 hover:text-white mr-3 flex-shrink-0 transition-colors">
          {task.is_completed ? (
            <CheckCircle2 className={isSubtask ? "w-4 h-4 text-blue-500" : "w-5 h-5 text-blue-500"} />
          ) : (
            <Circle className={isSubtask ? "w-4 h-4" : "w-5 h-5"} />
          )}
        </button>
        
        <div className="flex-1 flex flex-col pt-0.5">
          <div className="flex items-center justify-between">
            <span className={classNames("text-[14px]", { 
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

          {/* Render Subtasks if any */}
          {task.subtasks && task.subtasks.map((sub: any) => (
            <TaskItem key={sub.id} task={sub} isSubtask={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const Inbox = () => {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-white mb-2">Inbox</h1>
        <p className="text-gray-500 text-[13px]">Uncategorized and new tasks</p>
      </div>

      <div className="space-y-1">
        {mockTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      <button className="mt-4 flex items-center space-x-2 text-[#db4c3f] hover:text-[#c53727] text-[14px] font-medium transition-colors p-2 -ml-2 rounded-md hover:bg-[#282828]">
        <Plus className="w-4.5 h-4.5" />
        <span>Add task</span>
      </button>
    </div>
  );
};

export const Today = () => {
  const [hasTasks] = useState(false); // Toggle for demoing empty state

  if (!hasTasks) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 relative">
          {/* Simple representative illustration of the flower from the screenshot */}
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
        <button className="flex items-center space-x-2 bg-[#db4c3f] hover:bg-[#c53727] text-white px-4 py-2 rounded-md text-[13px] font-bold transition-all shadow-lg active:scale-95">
          <Plus className="w-4 h-4" />
          <span>Add task</span>
        </button>
      </div>
    );
  }

  return <Inbox />; // Or a generic view
};

export const Upcoming = () => {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-white mb-1">Upcoming</h1>
          <div className="flex items-center space-x-1.5 text-gray-400 text-[13px] font-medium cursor-pointer hover:text-white transition-colors">
            <span>April 2026</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-1 text-gray-500 hover:bg-[#282828] rounded-md transition-all"><ChevronLeft className="w-5 h-5" /></button>
          <button className="px-2 py-1 bg-[#282828] border border-[#333] rounded text-[11px] font-bold text-gray-300 hover:text-white transition-all">Today</button>
          <button className="p-1 text-gray-500 hover:bg-[#282828] rounded-md transition-all"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Date Header Grouped tasks */}
      <div className="space-y-12">
        {mockUpcomingTasksByDate.map((group) => (
          <div key={group.date} className="relative">
            <div className="sticky top-0 bg-[#1e1e1e] py-1 border-b border-[#282828] mb-2 z-10">
              <span className="text-[13px] font-bold text-gray-300">{group.date}</span>
            </div>
            <div className="space-y-1 pl-1">
              {group.tasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
              <button className="mt-3 flex items-center space-x-2 text-[#db4c3f] hover:text-[#c53727] text-[13px] font-medium transition-colors p-1 -ml-1 rounded-md hover:bg-[#282828]">
                <Plus className="w-4 h-4" />
                <span>Add task</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

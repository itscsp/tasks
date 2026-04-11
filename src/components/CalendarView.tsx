import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  addDays, 
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Task } from '../lib/taskUtils';

interface CalendarViewProps {
  tasks: Task[];
  onAddTask: (date: string) => void;
  onTaskClick: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onAddTask, onTaskClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-[#282828] rounded-lg text-gray-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 bg-[#282828] border border-[#333] rounded-md text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-[#282828] rounded-lg text-gray-400 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const dateStr = format(day, 'yyyy-MM-dd');
        
        // Filter tasks for this specific day
        const dayTasks = tasks.filter(task => {
          if (!task.due_date) return false;
          // Handle both format yyyy-MM-dd and potentially others
          return task.due_date.startsWith(dateStr);
        });

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] p-2 border border-[#282828] relative group transition-all duration-200 hover:bg-[#232323] ${
              !isSameMonth(day, monthStart) ? 'bg-[#1a1a1a] opacity-30' : 'bg-[#1e1e1e]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[13px] font-medium ${
                isToday(day) 
                  ? 'w-7 h-7 flex items-center justify-center bg-[#db4c3f] text-white rounded-full' 
                  : 'text-gray-400'
              }`}>
                {formattedDate}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTask(dateStr);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#333] rounded transition-all text-gray-500 hover:text-gray-200"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="text-[11px] px-2 py-1 rounded bg-[#282828] border-l-2 border-[#db4c3f] text-gray-200 truncate cursor-pointer hover:bg-[#333] transition-colors"
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border border-[#282828] rounded-xl overflow-hidden shadow-2xl">{rows}</div>;
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

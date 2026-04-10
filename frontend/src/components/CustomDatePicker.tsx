import { useState, useRef, useEffect } from 'react';
import { format, addDays, nextMonday, nextSaturday } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Calendar as CalendarIcon, Sun, ArrowRightSquare, Coffee, Slash } from 'lucide-react';
import classNames from 'classnames';

// NOTE: in react-day-picker v9, the styles are imported like this:
import 'react-day-picker/style.css';

interface CustomDatePickerProps {
  value: string;
  onChange: (val: string) => void;
}

export const CustomDatePicker = ({ value, onChange }: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : undefined;
  
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Create date adjusted for local timezone before saving as YYYY-MM-DD
      const adjusted = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      onChange(adjusted.toISOString().split('T')[0]);
    } else {
      onChange('');
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const nextWeek = nextMonday(today);
  const nextWeekend = nextSaturday(today);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
          "flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-[13px] font-medium cursor-pointer transition-colors w-fit",
          value ? "border-[#363636] text-green-500 hover:bg-[#363636]" : "border-transparent text-gray-400 hover:bg-[#363636] hover:text-gray-200"
        )}
      >
        <CalendarIcon className="w-4 h-4" />
        <span>{value ? format(selectedDate!, "d MMM") : "Due date"}</span>
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-10 left-0 z-50 bg-[#262626] border border-[#333] rounded-xl shadow-2xl w-[280px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Shortcuts */}
          <div className="py-2 border-b border-[#363636]">
            <button 
              onClick={(e) => { e.preventDefault(); handleSelect(tomorrow); }}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#363636] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Sun className="w-4 h-4 text-orange-400" />
                <span className="text-[13px] text-gray-200 font-medium">Tomorrow</span>
              </div>
              <span className="text-[12px] text-gray-500">{format(tomorrow, 'eee')}</span>
            </button>

            <button 
              onClick={(e) => { e.preventDefault(); handleSelect(nextWeek); }}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#363636] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ArrowRightSquare className="w-4 h-4 text-purple-400" />
                <span className="text-[13px] text-gray-200 font-medium">Next week</span>
              </div>
              <span className="text-[12px] text-gray-500">{format(nextWeek, 'eee d MMM')}</span>
            </button>

            <button 
              onClick={(e) => { e.preventDefault(); handleSelect(nextWeekend); }}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#363636] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Coffee className="w-4 h-4 text-blue-400" />
                <span className="text-[13px] text-gray-200 font-medium">Next weekend</span>
              </div>
              <span className="text-[12px] text-gray-500">{format(nextWeekend, 'eee d MMM')}</span>
            </button>

            <button 
              onClick={(e) => { e.preventDefault(); handleSelect(undefined); }}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#363636] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Slash className="w-4 h-4 text-gray-500" />
                <span className="text-[13px] text-gray-200 font-medium">No Date</span>
              </div>
            </button>
          </div>

          {/* Calendar Picker */}
          <div className="p-3 bg-[#202020]">
            <DayPicker 
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              showOutsideDays
              className="custom-calendar-style"
            />
          </div>

        </div>
      )}
    </div>
  );
};

import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { PlusCircle, Search, Inbox, Calendar, CalendarDays, Hash, ChevronDown } from 'lucide-react';

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen bg-[#FDFDFD] text-[#333]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#F8F9FA] border-r border-gray-200 flex flex-col h-full overflow-y-auto">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">C</div>
            <span className="font-semibold text-sm">Chethan</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600"><ChevronDown className="w-4 h-4" /></button>
        </div>

        <div className="px-3 pb-2 space-y-1">
          <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-sm font-medium">
            <PlusCircle className="w-4 h-4" />
            <span>Add task</span>
          </button>
          
          <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
          
          <NavLink to="/" className={({isActive}) => `w-full flex items-center space-x-2 px-2 py-1.5 rounded-md transition-colors text-sm ${isActive ? 'bg-[#EEEEEE] text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Inbox className="w-4 h-4 text-blue-500" />
            <span>Inbox</span>
          </NavLink>
          
          <NavLink to="/today" className={({isActive}) => `w-full flex items-center space-x-2 px-2 py-1.5 rounded-md transition-colors text-sm ${isActive ? 'bg-[#EEEEEE] text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Calendar className="w-4 h-4 text-green-500" />
            <span>Today</span>
          </NavLink>
          
          <NavLink to="/upcoming" className={({isActive}) => `w-full flex items-center space-x-2 px-2 py-1.5 rounded-md transition-colors text-sm ${isActive ? 'bg-[#EEEEEE] text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            <CalendarDays className="w-4 h-4 text-purple-500" />
            <span>Upcoming</span>
          </NavLink>
        </div>

        <div className="mt-4 px-3">
          <div className="flex items-center justify-between px-2 py-1 group cursor-pointer">
            <span className="text-xs font-semibold text-gray-500 hover:text-gray-700">Projects</span>
            <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"><PlusCircle className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-0.5 mt-1">
            <NavLink to="/project/1" className={({isActive}) => `w-full flex items-center space-x-2 px-2 py-1.5 rounded-md transition-colors text-sm ${isActive ? 'bg-[#EEEEEE] text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Hash className="w-4 h-4 text-gray-400" />
              <span>Personal</span>
            </NavLink>
            <NavLink to="/project/2" className={({isActive}) => `w-full flex items-center space-x-2 px-2 py-1.5 rounded-md transition-colors text-sm ${isActive ? 'bg-[#EEEEEE] text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Hash className="w-4 h-4 text-gray-400" />
              <span>Work</span>
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white flex justify-center">
        <div className="w-full max-w-3xl py-10 px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

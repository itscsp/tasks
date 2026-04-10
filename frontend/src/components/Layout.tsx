import { type ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Inbox, 
  Calendar, 
  CalendarDays, 
  ChevronDown, 
  Bell, 
  LayoutPanelLeft,
  Filter,
  BarChart3,
  Menu,
  X
} from 'lucide-react';

export const Layout = ({ children }: { children: ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', icon: Inbox, label: 'Inbox', color: 'text-sky-400', count: 2 },
    { to: '/today', icon: Calendar, label: 'Today', color: 'text-green-500' },
    { to: '/upcoming', icon: CalendarDays, label: 'Upcoming', color: 'text-purple-400' },
    { to: '/filters', icon: Filter, label: 'Filters & Labels', color: 'text-yellow-500' },
    { to: '/reporting', icon: BarChart3, label: 'Reporting', color: 'text-rose-400' },
  ];

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-[#eee] antialiased overflow-hidden">
      {/* Mobile Menu Trigger */}
      {!isMobileMenuOpen && (
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#db4c3f] rounded-full shadow-2xl flex items-center justify-center z-50 transition-transform active:scale-90"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-[#282828] flex flex-col h-full 
        transition-transform duration-300 ease-in-out border-r border-[#333]
        lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* User Profile Section */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 group cursor-pointer p-1 rounded-md hover:bg-[#363636] transition-colors">
            <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-transparent group-hover:ring-[#555] transition-all">K</div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-[13px] text-gray-200">Kiran</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#363636] rounded-md transition-all"><Bell className="w-[18px] h-[18px]" /></button>
            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#363636] rounded-md transition-all hidden lg:block"><LayoutPanelLeft className="w-[18px] h-[18px]" /></button>
            <button className="p-1.5 text-gray-400 hover:text-white lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Actions */}
        <div className="px-3 space-y-0.5">
          <button className="w-full flex items-center space-x-3 px-2 py-2 text-[#db4c3f] hover:bg-[#363636] rounded-md transition-colors text-[13px] font-medium group">
            <Plus className="w-4 h-4 p-0.5 bg-[#db4c3f] text-white rounded-full group-hover:scale-110 transition-transform" />
            <span>Add task</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-2 py-2 text-gray-400 hover:bg-[#363636] rounded-md transition-colors text-[13px]">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3 space-y-0.5 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink 
              key={item.to}
              to={item.to} 
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `
                group w-full flex items-center justify-between px-2 py-2 rounded-md transition-colors text-[13px]
                ${isActive ? 'bg-[#363636] text-white font-medium' : 'text-gray-300 hover:bg-[#363636]'}
              `}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`w-[18px] h-[18px] ${item.color}`} />
                <span>{item.label}</span>
              </div>
              {item.count && (
                <span className="text-[11px] text-gray-500 font-medium group-hover:text-gray-400 transition-colors">{item.count}</span>
              )}
            </NavLink>
          ))}

          {/* Projects Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between px-2 py-2 group cursor-pointer mb-0.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-0.5">My Projects</span>
              <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="space-y-0.5">
              <NavLink to="/project/daily" className={({ isActive }) => `
                w-full flex items-center space-x-3 px-2 py-2 rounded-md transition-colors text-[13px]
                ${isActive ? 'bg-[#363636] text-white font-medium' : 'text-gray-300 hover:bg-[#363636]'}
              `}>
                <span className="text-[#db4c3f] text-lg font-bold w-[18px] text-center">#</span>
                <span className="truncate flex-1">Daily tasks</span>
                <span className="text-[11px] text-gray-500">1</span>
              </NavLink>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#1e1e1e] relative scroll-smooth">
        <div className="w-full max-w-[800px] mx-auto pt-16 pb-32 px-6 lg:px-12">
          {children}
        </div>
      </main>
    </div>
  );
};

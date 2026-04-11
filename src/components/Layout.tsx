import { type ReactNode, useState, useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AddTaskModal } from './AddTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { AddProjectModal } from './AddProjectModal';
import { useTaskStore } from '../store/useTaskStore';
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
  const { user } = useContext(AuthContext);
  const { projects, fetchProjects, addProjectLocally, addTaskLocally } = useTaskStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);


  useEffect(() => {
    // Listen for task detail requests
    const handleOpenDetail = (e: any) => setSelectedTaskId(e.detail);
    window.addEventListener('open-task-detail', handleOpenDetail);
    return () => window.removeEventListener('open-task-detail', handleOpenDetail);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const navItems = [
    { to: '/', icon: Inbox, label: 'Inbox', color: 'text-sky-400' },
    { to: '/today', icon: Calendar, label: 'Today', color: 'text-green-500' },
    { to: '/upcoming', icon: CalendarDays, label: 'Upcoming', color: 'text-purple-400' },
    { to: '/calendar', icon: CalendarDays, label: 'Calendar', color: 'text-indigo-400' },
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
            <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-transparent group-hover:ring-[#555] transition-all">
              {user?.name?.[0].toUpperCase() || 'K'}
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-[13px] text-gray-200 truncate max-w-[100px]">
                {user?.name || 'User'}
              </span>
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

        <div className="px-3 space-y-0.5">
          <button 
            onClick={() => setIsAddTaskModalOpen(true)}
            className="w-full flex items-center space-x-3 px-2 py-2 text-[#db4c3f] hover:bg-[#363636] rounded-md transition-colors text-[13px] font-medium group"
          >
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
            </NavLink>
          ))}

          {/* Projects Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between px-3 mb-2 group">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Projects</span>
                <button 
                  onClick={() => setIsAddProjectModalOpen(true)}
                  className="p-1 px-1.5 text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            
            <div className="space-y-0.5">
              {projects.map((project) => (
                <NavLink 
                  key={project.id}
                  to={`/project/${project.id}`} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    w-full flex items-center space-x-3 px-2 py-2 rounded-md transition-colors text-[13px]
                    ${isActive ? 'bg-[#363636] text-white font-medium' : 'text-gray-300 hover:bg-[#363636]'}
                  `}
                >
                  <span className="text-lg font-bold w-[18px] text-center" style={{ color: project.color || '#db4c3f' }}>#</span>
                  <span className="truncate flex-1">{project.title}</span>
                </NavLink>
              ))}

              {projects.length === 0 && (
                <div className="px-3 py-2 text-[11px] text-gray-600 italic">No projects yet</div>
              )}
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

      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onTaskAdded={(newTask) => {
          addTaskLocally(newTask);
        }}
      />

      <TaskDetailModal 
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => {
          // TaskDetailModal now updates context internally
        }}
      />
      <AddProjectModal 
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onProjectAdded={(newProject: any) => {
          addProjectLocally(newProject);
        }}
      />
    </div>
  );
};

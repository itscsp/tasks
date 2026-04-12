import { useState } from 'react';
import { Archive, RotateCcw, Loader2 } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import api from '../lib/api';

export const ArchivePage = () => {
  const { projects, updateProjectLocally } = useTaskStore();
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  // Filter archived projects
  const archivedProjects = projects.filter(p => p.is_archived);

  const handleUnarchive = async (id: number) => {
    setIsProcessing(id);
    try {
      await api.put(`/projects/${id}`, { is_archived: false });
      updateProjectLocally(id, { is_archived: false });
    } catch (err) {
      console.error('Failed to unarchive project', err);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="w-full pb-32">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-gray-500 mb-2">
            <Archive className="w-5 h-5" />
            <span className="text-[14px] font-medium">User Profile / Archive</span>
        </div>
        <h1 className="text-[28px] font-bold text-white tracking-tight">Archived Projects</h1>
        <p className="text-gray-500 text-[13px] mt-2">
          Projects stored here are hidden from the sidebar but their tasks remain visible in your inbox and calendars.
        </p>
      </div>

      <div className="space-y-3 mt-8">
        {archivedProjects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#333] rounded-2xl">
            <Archive className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-[14px]">No archived projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archivedProjects.map(project => (
              <div 
                key={project.id}
                className="bg-[#2d2d2d]/60 border border-[#333] rounded-xl p-5 flex flex-col group transition-all hover:border-[#444]"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#363636] flex items-center justify-center mr-3 shadow-sm border border-[#444]">
                    <span className="text-xl font-bold" style={{ color: project.color || '#db4c3f' }}>#</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-[15px] font-bold text-white truncate">{project.title}</h3>
                    <p className="text-[12px] text-gray-500 truncate">{project.description || 'No description'}</p>
                  </div>
                </div>

                <div className="mt-auto">
                    <button
                      disabled={isProcessing === project.id}
                      onClick={() => handleUnarchive(project.id)}
                      className="w-full py-2 bg-[#363636] hover:bg-[#444] text-white text-[13px] font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      {isProcessing === project.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <RotateCcw className="w-4 h-4 mr-2" />
                      )}
                      Unarchive Project
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

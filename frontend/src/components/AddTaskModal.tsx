import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { CustomDatePicker } from './CustomDatePicker';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded?: (task: any) => void;
}

export const AddTaskModal = ({ isOpen, onClose, onTaskAdded }: AddTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchProjects = async () => {
        try {
          const response = await api.get('/projects');
          setProjects(response.data);
        } catch (err) {
          console.error('Failed to fetch projects', err);
        }
      };
      fetchProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const response = await api.post('/tasks', {
        title,
        notes: description,
        due_date: dueDate,
        project_id: projectId,
        priority: 4,
        is_completed: false
      });
      if (onTaskAdded) onTaskAdded(response.data);
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Failed to add task', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[550px] bg-[#282828] rounded-2xl shadow-2xl border border-[#333] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-5">
          {/* Title Input */}
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Practice math problems daily at 4pm"
            className="w-full bg-transparent text-[19px] font-medium text-white placeholder:text-gray-600 outline-none mb-2"
          />
          
          {/* Description Input */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full bg-transparent text-[14px] text-gray-300 placeholder:text-gray-700 outline-none resize-none mb-4 scrollbar-hide"
            rows={3}
          />

          {/* Date Picker Chip */}
          <div className="flex items-center space-x-2 mb-6 -ml-2">
            <CustomDatePicker value={dueDate} onChange={setDueDate} />
            
            {/* User said "rest rest are not needed" so we hide Attachment, Priority, Resminders */}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-[#363636]">
            {/* Project Picker */}
            <div className="relative group">
              <select 
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="appearance-none bg-[#363636] text-gray-300 text-[13px] font-bold px-3 py-1.5 pl-8 rounded-lg outline-none cursor-pointer hover:bg-[#404040] transition-colors pr-8"
              >
                <option value="">Inbox</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                 <div className="w-3.5 h-3.5 border-2 border-gray-400 rounded-full"></div>
              </div>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 bg-[#363636] hover:bg-[#404040] text-[13px] font-bold text-gray-200 rounded-lg transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!title.trim() || isSaving}
                className="px-4 py-2 bg-[#db4c3f] hover:bg-[#c53727] disabled:opacity-50 text-[13px] font-bold text-white rounded-lg transition-all active:scale-95 flex items-center space-x-2 shadow-lg"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Add task</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

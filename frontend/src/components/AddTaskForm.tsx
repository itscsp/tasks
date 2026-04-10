import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

export interface AddedTaskData {
  title: string;
  description: string;
  dueDate: string;
}

interface AddTaskFormProps {
  onCancel: () => void;
  onSave: (data: AddedTaskData) => Promise<void> | void;
  isSaving?: boolean;
}

export const AddTaskForm = ({ onCancel, onSave, isSaving = false }: AddTaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await onSave({ title, description, dueDate });
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="border border-[#333] rounded-xl p-4 bg-[#282828] mt-2 mb-4 animate-in slide-in-from-top-2 duration-300">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task name"
        className="w-full bg-transparent text-[14px] font-medium text-white placeholder:text-gray-500 outline-none mb-2"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full bg-transparent text-[13px] text-gray-300 placeholder:text-gray-600 outline-none resize-none mb-4"
        rows={2}
      />
      
      {/* Custom Date Picker */}
      <div className="mb-4">
        <CustomDatePicker 
          value={dueDate} 
          onChange={setDueDate} 
        />
      </div>

      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#363636]">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-3 py-1.5 text-[13px] font-bold text-gray-400 hover:bg-[#363636] rounded-md transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={!title.trim() || isSaving}
          className="px-3 py-1.5 text-[13px] font-bold text-white bg-[#db4c3f] hover:bg-[#c53727] disabled:opacity-50 rounded-md transition-colors flex items-center space-x-2"
        >
          {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
          <span>Add task</span>
        </button>
      </div>
    </form>
  );
};

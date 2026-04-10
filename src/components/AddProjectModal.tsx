import React, { useState, useRef, useEffect } from 'react';
import { X, HelpCircle, ChevronDown, Check } from 'lucide-react';
import api from '../lib/api';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: () => void;
}

const COLORS = [
  { name: 'Charcoal', hex: '#808080' },
  { name: 'Red', hex: '#ff0000' },
  { name: 'Orange', hex: '#ffa500' },
  { name: 'Yellow', hex: '#ffff00' },
  { name: 'Green', hex: '#008000' },
  { name: 'Blue', hex: '#0000ff' },
  { name: 'Purple', hex: '#800080' },
];

export const AddProjectModal = ({ isOpen, onClose, onProjectAdded }: AddProjectModalProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsColorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await api.post('/projects', {
        title: name,
        color: color.hex
      });
      onProjectAdded();
      setName('');
      onClose();
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-[450px] bg-[#1e1e1e] rounded-xl shadow-2xl border border-[#333] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#333]">
          <div className="flex items-center space-x-2">
            <h2 className="text-[17px] font-bold text-white">Add project</h2>
            <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer" />
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-gray-200">Name</label>
            <div className="relative">
              <input 
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 120))}
                className="w-full bg-transparent border border-[#333] rounded-lg p-2.5 text-white outline-none focus:border-gray-500 transition-all text-[14px]"
              />
              <span className="absolute right-3 top-2.5 text-[11px] text-gray-500">{name.length}/120</span>
            </div>
          </div>

          {/* Color Dropdown */}
          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="text-[14px] font-bold text-gray-200">Color</label>
            <div 
              onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
              className="flex items-center justify-between bg-transparent border border-[#333] rounded-lg p-2.5 text-white cursor-pointer hover:border-gray-500 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color.hex }}></div>
                <span className="text-[14px]">{color.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>

            {isColorDropdownOpen && (
              <div className="absolute top-[100%] left-0 w-full mt-1 bg-[#282828] border border-[#333] rounded-lg shadow-xl z-50 py-1 max-h-[200px] overflow-y-auto">
                {COLORS.map((c) => (
                  <div 
                    key={c.name}
                    onClick={() => {
                      setColor(c);
                      setIsColorDropdownOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 hover:bg-[#363636] cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }}></div>
                      <span className="text-[14px] text-gray-200">{c.name}</span>
                    </div>
                    {color.name === c.name && <Check className="w-4 h-4 text-gray-400" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#333] mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-[#333] hover:bg-[#444] text-white text-[13px] font-bold rounded-lg transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!name.trim() || isLoading}
              className="px-4 py-2 bg-[#db4c3f] hover:bg-[#c53727] disabled:opacity-50 text-white text-[13px] font-bold rounded-lg transition-all"
            >
              {isLoading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

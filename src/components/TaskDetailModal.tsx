import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Plus,
  Tag,
  Flag,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  MessageSquare,
  ChevronDown,
  Loader2,
  Paperclip,
  Mic,
  Smile,
  Trash2,
  PanelRight,
  FileText,
  Image,
  Download,
  Upload
} from 'lucide-react';
import api from '../lib/api';
import classNames from 'classnames';
import { debounce } from '../lib/utils';
import type { Task } from '../lib/taskUtils';
import { CustomDatePicker } from './CustomDatePicker';
import { useTaskStore } from '../store/useTaskStore';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  date: string;
}

interface TaskDetailModalProps {
  taskId: number | null;
  onClose: () => void;
  onTaskUpdated: (task: Task) => void;
}

export const TaskDetailModal = ({ taskId, onClose, onTaskUpdated }: TaskDetailModalProps) => {
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isSubmittingSubtask, setIsSubmittingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { projects, updateTaskLocally, addTaskLocally, deleteTaskLocally } = useTaskStore();
  const [activeDropdown, setActiveDropdown] = useState<'project' | 'priority' | 'labels' | 'more' | null>(null);
  const [isSidebarOpenOnMobile, setIsSidebarOpenOnMobile] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const [localTitle, setLocalTitle] = useState('');
  const [localNotes, setLocalNotes] = useState('');
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [showReadMoreNotes, setShowReadMoreNotes] = useState(false);
  const notesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = notesRef.current;
    if (!el) return;
    
    // Reset to auto to get actual scroll height based on current text
    el.style.height = 'auto';
    const trueHeight = el.scrollHeight;
    
    if (trueHeight > 500) {
      setShowReadMoreNotes(true);
      el.style.height = isNotesExpanded ? `${trueHeight}px` : '500px';
    } else {
      setShowReadMoreNotes(false);
      el.style.height = `${trueHeight}px`;
    }
  }, [localNotes, isNotesExpanded]);



  const fetchTaskData = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const [taskRes, commentsRes] = await Promise.all([
        api.get(`/tasks/${taskId}`),
        api.get(`/tasks/${taskId}/comments`)
      ]);
      const data = taskRes.data;
      setTask(data);
      setLocalTitle(data.title);
      setLocalNotes(data.notes || '');
      setComments(commentsRes.data);
    } catch (err) {
      console.error('Failed to fetch task details', err);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchTaskData();
  }, [taskId]);

  const debouncedUpdate = useCallback(
    debounce(async (id: number, updates: Partial<Task>) => {
      try {
        await api.put(`/tasks/${id}`, updates);
      } catch (err) {
        console.error('Failed to update task', err);
      }
    }, 1000),
    []
  );

  if (!taskId) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalTitle(val);
    if (task) {
      // Update local modal state immediately for smooth typing
      setTask({ ...task, title: val });
      // Sync to global store immediately (local only, no extra API call)
      updateTaskLocally(task.id, { title: val });
      // Persist to API after user stops typing (debounced, no redundant local update)
      debouncedUpdate(task.id, { title: val });
    }
  };

  const handleNotesChange = (val: string) => {
    setLocalNotes(val);
    if (task) {
      setTask({ ...task, notes: val });
      updateTaskLocally(task.id, { notes: val });
      debouncedUpdate(task.id, { notes: val });
    }
  };

  const handleUpdateImmediate = async (updates: Partial<Task>) => {
    if (!task) return;
    const updatedTask = { ...task, ...updates };
    setTask(updatedTask);
    updateTaskLocally(task.id, updates);
    onTaskUpdated(updatedTask);
    try {
      await api.put(`/tasks/${task.id}`, updates);
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!task || isDeletingTask || !window.confirm('Are you sure you want to delete this task?')) return;

    setIsDeletingTask(true);
    try {
      await api.delete(`/tasks/${task.id}`);
      deleteTaskLocally(task.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete task', err);
      setIsDeletingTask(false);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task || isSubmittingSubtask) return;

    setIsSubmittingSubtask(true);
    try {
      const response = await api.post('/tasks', {
        title: newSubtaskTitle,
        parent_task_id: task.id,
        project_id: task.project_id,
        is_completed: false
      });
      const newTask = response.data;
      setTask({
        ...task,
        subtasks: [...(task.subtasks || []), newTask]
      });
      addTaskLocally(newTask);
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    } catch (err) {
      console.error('Failed to add subtask', err);
    } finally {
      setIsSubmittingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subId: number) => {
    if (!task || !task.subtasks) return;
    const subtask = task.subtasks.find(s => s.id === subId);
    if (!subtask) return;

    const nextStatus = !subtask.is_completed;
    const updatedSubtasks = task.subtasks.map(s =>
      s.id === subId ? { ...s, is_completed: nextStatus } : s
    );

    const updatedTask = { ...task, subtasks: updatedSubtasks };
    setTask(updatedTask);
    updateTaskLocally(subId, { is_completed: nextStatus });
    onTaskUpdated(updatedTask);

    try {
      await api.put(`/tasks/${subId}`, { is_completed: nextStatus });
    } catch (err) {
      setTask(task); // Rollback
      updateTaskLocally(subId, { is_completed: !nextStatus });
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;

    setIsPostingComment(true);
    try {
      const response = await api.post(`/tasks/${task.id}/comments`, { content: newComment });
      setComments([response.data, ...comments]);
      setNewComment('');
      setIsCommentFocused(false);
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleLabelRemove = (labelToRemove: string) => {
    if (!task) return;
    const updatedLabels = task.labels.filter(l => l !== labelToRemove);
    handleUpdateImmediate({ labels: updatedLabels });
  };

  const handleLabelAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !task) return;
    if (task.labels.includes(newLabel.trim())) {
      setNewLabel('');
      return;
    }
    const updatedLabels = [...task.labels, newLabel.trim()];
    handleUpdateImmediate({ labels: updatedLabels });
    setNewLabel('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length || !task) return;
    setIsUploadingAttachment(true);
    try {
      const wpBase = (import.meta.env.VITE_API_URL || 'http://kaasu-wp.local/wp-json/csp/v1')
        .replace('/wp-json/csp/v1', '').replace('/csp/v1', '');
      const token = localStorage.getItem('csp_token');
      const uploadedIds: number[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        const res = await fetch(`${wpBase}/wp-json/wp/v2/media`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedIds.push(data.id);
        }
      }
      if (uploadedIds.length > 0) {
        const existingIds = (task.attachments || []).map(a => a.id);
        const updatedIds = [...existingIds, ...uploadedIds];
        const res = await api.put(`/tasks/${task.id}`, { attachments: updatedIds });
        const updatedTask = res.data;
        setTask(updatedTask);
        updateTaskLocally(task.id, { attachments: updatedTask.attachments });
      }
    } catch (err) {
      console.error('Attachment upload failed', err);
    } finally {
      setIsUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = async (attId: number) => {
    if (!task) return;
    const updatedIds = (task.attachments || []).filter(a => a.id !== attId).map(a => a.id);
    try {
      const res = await api.put(`/tasks/${task.id}`, { attachments: updatedIds });
      const updatedTask = res.data;
      setTask(updatedTask);
      updateTaskLocally(task.id, { attachments: updatedTask.attachments });
    } catch (err) {
      console.error('Failed to remove attachment', err);
    }
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return <Image className="w-4 h-4 text-blue-400" />;
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  const getPriorityColor = (p: number) => {
    switch (p) {
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (isLoading || !task) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-[800px] h-[600px] bg-[#282828] rounded-2xl flex items-center justify-center border border-[#333]">
          <Loader2 className="w-8 h-8 text-[#db4c3f] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="w-full sm:w-[80vw] sm:max-w-none h-full sm:h-[80vh] bg-[#282828] rounded-none sm:rounded-2xl shadow-2xl border-none sm:border border-[#333] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-2.5 border-b border-[#333] flex items-center justify-between bg-[#2d2d2d]">
          <div className="flex items-center space-x-2 text-gray-400 text-[11px] font-bold uppercase tracking-wider overflow-hidden max-w-[70%]">
            <span
              onClick={onClose}
              className="cursor-pointer hover:text-white transition-colors truncate shrink-0"
            >
              {projects.find(p => p.id.toString() === task.project_id)?.title || 'Inbox'}
            </span>
            <span className="text-gray-600 shrink-0">/</span>
            {task.ancestors?.map(ancestor => (
              <React.Fragment key={ancestor.id}>
                <span
                  onClick={() => window.dispatchEvent(new CustomEvent('open-task-detail', { detail: ancestor.id }))}
                  className="cursor-pointer hover:text-white transition-colors truncate max-w-[120px] shrink-0"
                >
                  {ancestor.title}
                </span>
                <span className="text-gray-600 shrink-0">/</span>
              </React.Fragment>
            ))}
            <span className="text-white truncate">Task Details</span>
          </div>
          <div className="flex items-center space-x-2 relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'more' ? null : 'more')}
              className="p-1 px-2 text-gray-400 hover:text-white transition-all"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSidebarOpenOnMobile(!isSidebarOpenOnMobile)}
              className="p-1 px-2 text-gray-400 hover:text-white transition-all md:hidden"
            >
              <PanelRight className={classNames("w-5 h-5", { "text-[#db4c3f]": isSidebarOpenOnMobile })} />
            </button>
            <button onClick={onClose} className="p-1 px-2 text-gray-400 hover:text-white transition-all"><X className="w-5 h-5" /></button>

            {/* More Actions Dropdown */}
            {activeDropdown === 'more' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                <div className="absolute top-full right-0 mt-1 w-48 bg-[#282828] border border-[#333] rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    disabled={isDeletingTask}
                    onClick={() => {
                      handleDeleteTask();
                      setActiveDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-[13px] text-red-500 hover:bg-[#333] flex items-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    {isDeletingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span>{isDeletingTask ? 'Deleting...' : 'Delete task'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          <div className="flex-none md:flex-1 md:overflow-y-auto p-5 sm:p-8 scrollbar-hide">
            {/* Title & Notes */}
            <div className="flex items-start space-x-4 mb-4 group">
              <button
                onClick={() => handleUpdateImmediate({ is_completed: !task.is_completed })}
                className="mt-1.5 text-gray-500 hover:text-white flex-shrink-0 transition-all scale-110"
              >
                {task.is_completed ? <CheckCircle2 className="w-6 h-6 text-blue-500" /> : <Circle className="w-6 h-6" />}
              </button>
              <div className="flex-1">
                <input
                  spellCheck="false"
                  type="text"
                  value={localTitle}
                  onChange={handleTitleChange}
                  className={classNames("w-full bg-transparent text-[22px] font-bold text-white outline-none mb-0.5 border-b border-transparent focus:border-[#db4c3f]/20 transition-all", {
                    "text-gray-500 line-through": task.is_completed
                  })}
                />
                <div className="relative overflow-hidden" ref={notesRef}>
                  <div className="quill-custom-wrapper pb-2">
                    <ReactQuill 
                      theme="snow"
                      value={localNotes || ''}
                      onChange={handleNotesChange}
                      placeholder="Description"
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'clean']
                        ]
                      }}
                    />
                  </div>
                  {!isNotesExpanded && showReadMoreNotes && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#282828] via-[#282828]/80 to-transparent pointer-events-none flex items-end py-2">
                      <button
                        type="button"
                        onClick={() => setIsNotesExpanded(true)}
                        className="pointer-events-auto z-10 text-[13px] font-bold text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                      >
                        <ChevronDown className="w-4 h-4" />
                        <span>Read more</span>
                      </button>
                    </div>
                  )}
                  {isNotesExpanded && showReadMoreNotes && (
                    <div className="mt-2 flex items-center mb-1">
                      <button
                        type="button"
                        onClick={() => setIsNotesExpanded(false)}
                        className="text-[13px] font-bold text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                      >
                        <ChevronDown className="w-4 h-4 rotate-180" />
                        <span>Show less</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subtasks */}
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-3">
                <Plus className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[12px] font-bold text-white uppercase tracking-wider">Sub-tasks</span>
              </div>

              <div className="space-y-1">
                {task.subtasks?.map(sub => (
                  <div key={sub.id} className="flex items-center space-x-3 group py-1.5 border-b border-[#333]/30 hover:bg-[#2d2d2d] px-2 rounded-lg transition-all">
                    <button
                      onClick={() => handleToggleSubtask(sub.id)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      {sub.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <span
                      onClick={() => window.dispatchEvent(new CustomEvent('open-task-detail', { detail: sub.id }))}
                      className={classNames("text-[14px] text-gray-200 flex-1 cursor-pointer hover:text-[#db4c3f] transition-all", {
                        "line-through text-gray-500 hover:text-gray-400": sub.is_completed
                      })}
                    >
                      {sub.title}
                    </span>
                  </div>
                ))}
                {!isAddingSubtask ? (
                  <button
                    onClick={() => setIsAddingSubtask(true)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-[#db4c3f] transition-all py-1.5 px-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-[13px]">Add sub-task</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddSubtask} className="flex items-center space-x-3 mt-2 bg-[#2d2d2d] p-2.5 rounded-lg border border-[#363636]">
                    <Circle className="w-4 h-4 text-gray-500" />
                    <input
                      autoFocus
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add sub-task"
                      className="bg-transparent text-[14px] text-white outline-none flex-1"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        type="submit"
                        disabled={!newSubtaskTitle.trim() || isSubmittingSubtask}
                        className="text-[#db4c3f] text-[12px] font-bold px-2 py-1 disabled:opacity-50 flex items-center space-x-1"
                      >
                        {isSubmittingSubtask && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>Add</span>
                      </button>
                      <button type="button" onClick={() => setIsAddingSubtask(false)} className="text-gray-500 text-[12px] px-2 py-1">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="mt-6 border-t border-[#333]/50 pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[12px] font-bold text-white uppercase tracking-wider">Attachments</span>
                  {task.attachments && task.attachments.length > 0 && (
                    <span className="text-[10px] text-gray-500 bg-[#333] px-1.5 py-0.5 rounded-full">{task.attachments.length}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAttachment}
                  className="flex items-center space-x-1.5 px-2.5 py-1 text-[12px] text-gray-400 hover:text-white bg-[#2d2d2d] hover:bg-[#363636] rounded-lg border border-[#333] transition-all disabled:opacity-50"
                >
                  {isUploadingAttachment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{isUploadingAttachment ? 'Uploading...' : 'Add file'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {task.attachments && task.attachments.length > 0 ? (
                <div className="space-y-1.5">
                  {task.attachments.map(att => (
                    <div key={att.id} className="flex items-center space-x-3 p-2.5 bg-[#2d2d2d]/50 rounded-lg border border-[#333]/60 hover:border-[#444] group/att transition-all">
                      {getFileIcon(att.name)}
                      <span className="flex-1 text-[13px] text-gray-300 truncate">{att.name}</span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover/att:opacity-100 transition-opacity">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-blue-400 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 rounded transition-colors"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#333] rounded-xl p-6 text-center cursor-pointer hover:border-[#db4c3f]/40 hover:bg-[#db4c3f]/5 transition-all group/drop"
                >
                  <Upload className="w-5 h-5 text-gray-600 group-hover/drop:text-[#db4c3f]/60 mx-auto mb-2 transition-colors" />
                  <p className="text-[12px] text-gray-600 group-hover/drop:text-gray-500 transition-colors">Click to attach files</p>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="mt-8 border-t border-[#333]/50 pt-8 pb-10">
              <div className="flex items-center space-x-2 mb-4 text-gray-400">
                <MessageSquare className="w-4 h-4" />
                <span className="text-[12px] font-bold text-white uppercase tracking-wider">Comments</span>
              </div>

              {/* Enhanced Comment Box System */}
              <div className={classNames("bg-[#2d2d2d]/30 border border-[#333] rounded-xl transition-all duration-300 mb-8 overflow-hidden group/box", {
                "ring-1 ring-[#db4c3f]/30 border-[#444] bg-[#2d2d2d]/50": isCommentFocused
              })}>
                <textarea
                  value={newComment}
                  onFocus={() => setIsCommentFocused(true)}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Comment"
                  className={classNames("w-full bg-transparent p-4 text-gray-200 text-[13px] outline-none placeholder:text-gray-500 resize-none transition-all", {
                    "min-h-[120px]": isCommentFocused,
                    "min-h-[50px]": !isCommentFocused
                  })}
                />

                {(isCommentFocused || newComment.trim()) && (
                  <div className="flex items-center justify-between p-3 px-4 border-t border-[#333] bg-[#2d2d2d]/40 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center space-x-4 text-gray-500">
                      <button type="button" className="hover:text-white transition-colors"><Paperclip className="w-4.5 h-4.5" /></button>
                      <button type="button" className="hover:text-white transition-colors"><Mic className="w-4.5 h-4.5" /></button>
                      <button type="button" className="hover:text-white transition-colors"><Smile className="w-4.5 h-4.5" /></button>
                      <button type="button" className="hover:text-white transition-colors font-bold text-xs">@</button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setNewComment('');
                          setIsCommentFocused(false);
                        }}
                        type="button"
                        className="px-4 py-1.5 bg-[#363636] hover:bg-[#404040] text-[13px] font-bold text-gray-200 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePostComment}
                        disabled={!newComment.trim() || isPostingComment}
                        className="px-4 py-1.5 bg-[#db4c3f] hover:bg-[#c53727] disabled:opacity-50 text-[13px] font-bold text-white rounded-lg transition-all flex items-center space-x-2"
                      >
                        {isPostingComment && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Comment</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex space-x-3 group">
                    <div className="w-7 h-7 rounded-full bg-[#363636] flex-shrink-0 flex items-center justify-center text-[10px] font-bold uppercase text-gray-400">
                      {comment.author_name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-0.5">
                        <span className="text-[12px] font-bold text-white">{comment.author_name}</span>
                        <span className="text-[10px] text-gray-500">{new Date(comment.date).toLocaleString()}</span>
                      </div>
                      <p className="text-[13px] text-gray-300 bg-[#2d2d2d] p-2.5 rounded-lg border border-[#333]/30 inline-block">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className={classNames(
            "w-full md:w-[320px] bg-[#1e1e1e] border-t md:border-t-0 md:border-l border-[#333] p-5 space-y-6 md:overflow-y-auto scrollbar-hide transition-all",
            { "hidden md:block": !isSidebarOpenOnMobile, "block": isSidebarOpenOnMobile }
          )}>
            <section className="relative">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Project</h3>
              <div
                onClick={() => setActiveDropdown(activeDropdown === 'project' ? null : 'project')}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#2d2d2d] cursor-pointer transition-all bg-[#282828]/40 border border-transparent hover:border-[#333]"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-[#db4c3f] font-bold">#</span>
                  <span className="text-[12px] text-gray-200 truncate max-w-[160px]">
                    {projects.find(p => p.id.toString() === task.project_id)?.title || 'Inbox'}
                  </span>
                </div>
                <ChevronDown className={classNames("w-3.5 h-3.5 text-gray-600 transition-transform", { "rotate-180": activeDropdown === 'project' })} />
              </div>

              {activeDropdown === 'project' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#262626] border border-[#333] rounded-xl shadow-2xl z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                    <div
                      onClick={() => {
                        handleUpdateImmediate({ project_id: "" });
                        setActiveDropdown(null);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-[#333] cursor-pointer text-[12px] text-gray-300 transition-colors"
                    >
                      <span className="text-gray-500 font-bold">#</span>
                      <span>Inbox</span>
                    </div>
                    {projects.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          handleUpdateImmediate({ project_id: p.id.toString() });
                          setActiveDropdown(null);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 hover:bg-[#333] cursor-pointer text-[12px] text-gray-300 transition-colors"
                      >
                        <span style={{ color: p.color || '#db4c3f' }} className="font-bold">#</span>
                        <span className="truncate">{p.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Due date</h3>
              <div className="bg-[#282828]/40 rounded-lg hover:bg-[#2d2d2d] transition-all border border-transparent hover:border-[#333]">
                <CustomDatePicker
                  value={task.due_date || ''}
                  onChange={(date) => handleUpdateImmediate({ due_date: date })}
                />
              </div>
            </section>

            <section className="relative">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Priority</h3>
              <div
                onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#2d2d2d] cursor-pointer transition-all bg-[#282828]/40 border border-transparent hover:border-[#333]"
              >
                <div className={classNames("flex items-center space-x-3 font-medium text-[12px]", getPriorityColor(task.priority))}>
                  <Flag className="w-4 h-4 fill-current" />
                  <span>Priority {task.priority || 4}</span>
                </div>
                <ChevronDown className={classNames("w-3.5 h-3.5 text-gray-600 transition-transform", { "rotate-180": activeDropdown === 'priority' })} />
              </div>

              {activeDropdown === 'priority' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#262626] border border-[#333] rounded-xl shadow-2xl z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                  {[1, 2, 3, 4].map(p => (
                    <div
                      key={p}
                      onClick={() => {
                        handleUpdateImmediate({ priority: p });
                        setActiveDropdown(null);
                      }}
                      className={classNames("flex items-center space-x-3 px-3 py-2 hover:bg-[#333] cursor-pointer text-[12px] transition-colors", getPriorityColor(p))}
                    >
                      <Flag className={classNames("w-4 h-4", { "fill-current": p < 4 })} />
                      <span>Priority {p}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Labels</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-[#282828]/40 rounded-lg border border-dashed border-[#444]">
                  {task.labels && task.labels.length > 0 ? (
                    task.labels.map(l => (
                      <span
                        key={l}
                        onClick={() => handleLabelRemove(l)}
                        className="flex items-center space-x-1.5 px-2 py-0.5 bg-[#363636] hover:bg-[#444] text-[11px] text-gray-300 rounded-md cursor-pointer transition-colors group/label"
                      >
                        <Tag className="w-3 h-3 text-gray-500 group-hover/label:text-gray-300" />
                        <span>{l}</span>
                        <X className="w-3 h-3 text-gray-600 group-hover/label:text-gray-300" />
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-gray-600 italic px-1">No labels</span>
                  )}
                </div>

                <form onSubmit={handleLabelAdd} className="relative">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Add label..."
                    className="w-full bg-[#2d2d2d] border border-[#333] rounded-lg px-3 py-1.5 text-[12px] text-gray-200 outline-none focus:border-[#db4c3f]/50 transition-all pl-8"
                  />
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

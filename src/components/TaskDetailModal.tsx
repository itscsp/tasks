import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
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
  Smile
} from 'lucide-react';
import api from '../lib/api';
import classNames from 'classnames';
import { debounce } from '../lib/utils';

interface Task {
  id: number;
  title: string;
  notes?: string;
  is_completed: boolean;
  priority: number;
  due_date?: string;
  labels: string[];
  project_id?: string;
  subtasks?: Task[];
}

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
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const [localTitle, setLocalTitle] = useState('');
  const [localNotes, setLocalNotes] = useState('');

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
        window.dispatchEvent(new Event('task-added'));
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
      setTask({ ...task, title: val });
      debouncedUpdate(task.id, { title: val });
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalNotes(val);
    if (task) {
      setTask({ ...task, notes: val });
      debouncedUpdate(task.id, { notes: val });
    }
  };

  const handleUpdateImmediate = async (updates: Partial<Task>) => {
    if (!task) return;
    const updatedTask = { ...task, ...updates };
    setTask(updatedTask);
    onTaskUpdated(updatedTask);
    try {
      await api.put(`/tasks/${task.id}`, updates);
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task) return;

    try {
      const response = await api.post('/tasks', {
        title: newSubtaskTitle,
        parent_task_id: task.id,
        is_completed: false
      });
      setTask({
        ...task,
        subtasks: [...(task.subtasks || []), response.data]
      });
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    } catch (err) {
      console.error('Failed to add subtask', err);
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-[860px] h-[85vh] bg-[#282828] rounded-2xl shadow-2xl border border-[#333] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-2.5 border-b border-[#333] flex items-center justify-between bg-[#2d2d2d]">
          <div className="flex items-center space-x-2 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
            <span className="cursor-pointer hover:text-white transition-colors">Inbox</span>
            <span className="text-gray-600">/</span>
            <span className="text-white">Task Details</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 px-2 text-gray-400 hover:text-white transition-all"><MoreHorizontal className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-1 px-2 text-gray-400 hover:text-white transition-all"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
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
                <textarea 
                  spellCheck="false"
                  value={localNotes}
                  onChange={handleNotesChange}
                  placeholder="Description"
                  className="w-full bg-transparent text-[14px] text-gray-300 placeholder:text-gray-600 outline-none resize-none min-h-[40px] leading-relaxed"
                  rows={2}
                />
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
                  <div key={sub.id} className="flex items-center space-x-3 group py-1.5 border-b border-transparent hover:bg-[#2d2d2d] px-2 rounded-lg transition-all">
                    <Circle className="w-4 h-4 text-gray-500" />
                    <span className={classNames("text-[14px] text-gray-200", { "line-through text-gray-500": sub.is_completed })}>{sub.title}</span>
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
                        <button type="submit" className="text-[#db4c3f] text-[12px] font-bold px-2 py-1">Add</button>
                        <button type="button" onClick={() => setIsAddingSubtask(false)} className="text-gray-500 text-[12px] px-2 py-1">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
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
          <div className="w-[260px] bg-[#1e1e1e] border-l border-[#333] p-5 space-y-6 overflow-y-auto scrollbar-hide">
            <section>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Project</h3>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#2d2d2d] cursor-pointer transition-all bg-[#282828]/40">
                 <div className="flex items-center space-x-2">
                    <span className="text-gray-400 font-bold">#</span>
                    <span className="text-[12px] text-gray-200">Inbox</span>
                 </div>
                 <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
              </div>
            </section>
            <section>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Due date</h3>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#2d2d2d] cursor-pointer transition-all text-red-500/90 font-medium bg-[#282828]/40">
                 <Calendar className="w-4 h-4" />
                 <span className="text-[12px]">{task.due_date || 'Today'}</span>
              </div>
            </section>
            <section>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Priority</h3>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#2d2d2d] cursor-pointer transition-all text-green-500/90 font-medium bg-[#282828]/40">
                 <Flag className="w-4 h-4" />
                 <span className="text-[12px]">Priority {task.priority || 4}</span>
              </div>
            </section>
            <section>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Labels</h3>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#2d2d2d] cursor-pointer transition-all text-gray-500 bg-[#282828]/40">
                 <Tag className="w-4 h-4" />
                 <span className="text-[12px]">Add labels</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

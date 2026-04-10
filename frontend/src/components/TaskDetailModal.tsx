import React, { useState, useEffect } from 'react';
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
  Send,
  Loader2
} from 'lucide-react';
import api from '../lib/api';
import classNames from 'classnames';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const fetchTaskData = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const [taskRes, commentsRes] = await Promise.all([
        api.get(`/tasks/${taskId}`),
        api.get(`/tasks/${taskId}/comments`)
      ]);
      setTask(taskRes.data);
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

  if (!taskId) return null;

  const handleUpdate = async (updates: Partial<Task>) => {
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
        <div className="px-5 py-3 border-b border-[#333] flex items-center justify-between bg-[#2d2d2d]">
          <div className="flex items-center space-x-2 text-gray-400 text-[12px] font-medium uppercase tracking-wider">
            <span className="cursor-pointer hover:text-white transition-colors">Inbox</span>
            <span className="text-gray-600">/</span>
            <span className="text-white">Task Details</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1.5 text-gray-400 hover:text-white transition-all"><MoreHorizontal className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white transition-all"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
            {/* Title Section */}
            <div className="flex items-start space-x-4 mb-8 group">
              <button 
                onClick={() => handleUpdate({ is_completed: !task.is_completed })}
                className="mt-1 text-gray-500 hover:text-white flex-shrink-0 transition-all scale-110"
              >
                {task.is_completed ? <CheckCircle2 className="w-6 h-6 text-blue-500" /> : <Circle className="w-6 h-6" />}
              </button>
              <div className="flex-1">
                <input 
                   spellCheck="false"
                  type="text" 
                  value={task.title}
                  onChange={(e) => handleUpdate({ title: e.target.value })}
                  className={classNames("w-full bg-transparent text-[24px] font-bold text-white outline-none mb-1 border-b border-transparent focus:border-[#db4c3f]/30 transition-all", {
                    "text-gray-500 line-through": task.is_completed
                  })}
                />
                <textarea 
                   spellCheck="false"
                  value={task.notes || ''}
                  onChange={(e) => handleUpdate({ notes: e.target.value })}
                  placeholder="Notes"
                  className="w-full bg-transparent text-[14px] text-gray-300 placeholder:text-gray-600 outline-none resize-none min-h-[100px]"
                />
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="mt-10">
              <div className="flex items-center space-x-2 mb-6">
                <Plus className="w-4.5 h-4.5 text-gray-400" />
                <span className="text-[14px] font-bold text-white uppercase tracking-wider">Sub-tasks</span>
              </div>
              
              <div className="space-y-4">
                {task.subtasks?.map(sub => (
                  <div key={sub.id} className="flex items-center space-x-3 group py-2 border-b border-[#333]/50 hover:bg-[#2d2d2d] px-2 rounded-lg transition-all">
                    <Circle className="w-4 h-4 text-gray-500" />
                    <span className={classNames("text-[14px] text-gray-200", { "line-through text-gray-500": sub.is_completed })}>{sub.title}</span>
                  </div>
                ))}

                {isAddingSubtask ? (
                  <form onSubmit={handleAddSubtask} className="flex items-center space-x-3 mt-4 bg-[#2d2d2d] p-3 rounded-lg border border-[#363636]">
                    <Circle className="w-4 h-4 text-gray-500" />
                    <input 
                      autoFocus
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add sub-task"
                      className="bg-transparent text-[14px] text-white outline-none flex-1"
                    />
                    <div className="flex items-center space-x-3">
                        <button type="submit" className="text-[#db4c3f] text-[13px] font-bold">Add</button>
                        <button type="button" onClick={() => setIsAddingSubtask(false)} className="text-gray-500 text-[13px]">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setIsAddingSubtask(true)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-[#db4c3f] transition-all py-2 px-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[14px]">Add sub-task</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="mt-20 border-t border-[#333] pt-10 pb-20">
              <div className="flex items-center space-x-2 mb-6 text-gray-400">
                <MessageSquare className="w-4.5 h-4.5" />
                <span className="text-[14px] font-bold text-white uppercase tracking-wider">Comments</span>
              </div>

              {/* Comment Input */}
              <form onSubmit={handlePostComment} className="flex space-x-4 mb-10">
                <div className="w-8 h-8 rounded-full bg-orange-600 flex-shrink-0 flex items-center justify-center text-[11px] font-bold uppercase">Me</div>
                <div className="flex-1 relative">
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-[#1e1e1e] border border-[#333] rounded-xl p-3 text-gray-200 text-[13px] outline-none focus:border-[#444] transition-all resize-none min-h-[80px]"
                    />
                    <button 
                        type="submit"
                        disabled={!newComment.trim() || isPostingComment}
                        className="absolute bottom-3 right-3 p-1.5 text-[#db4c3f] hover:bg-[#333] rounded-lg transition-all disabled:opacity-50"
                    >
                        {isPostingComment ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
                    </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-8">
                {comments.map(comment => (
                  <div key={comment.id} className="flex space-x-4 group">
                    <div className="w-8 h-8 rounded-full bg-[#363636] flex-shrink-0 flex items-center justify-center text-[11px] font-bold uppercase text-gray-400">
                        {comment.author_name[0]}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-[13px] font-bold text-white">{comment.author_name}</span>
                            <span className="text-[11px] text-gray-500">{new Date(comment.date).toLocaleString()}</span>
                        </div>
                        <p className="text-[13px] text-gray-300 leading-relaxed bg-[#2d2d2d] p-3 rounded-lg border border-[#333]/50 inline-block min-w-[100px]">
                            {comment.content}
                        </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-[280px] bg-[#1e1e1e] border-l border-[#333] p-6 space-y-8 overflow-y-auto scrollbar-hide">
            <section>
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Project</h3>
              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#2d2d2d] cursor-pointer transition-all bg-[#282828]/50 border border-transparent hover:border-[#333]">
                 <div className="flex items-center space-x-2.5">
                    <span className="text-gray-400 text-lg font-bold">#</span>
                    <span className="text-[13px] text-gray-200 font-medium">Inbox</span>
                 </div>
                 <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Due date</h3>
              <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-[#2d2d2d] cursor-pointer transition-all text-red-400 font-medium bg-[#282828]/50 border border-transparent hover:border-[#333]">
                 <Calendar className="w-[18px] h-[18px]" />
                 <span className="text-[13px]">{task.due_date || 'Today'}</span>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Priority</h3>
              <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-[#2d2d2d] cursor-pointer transition-all text-green-500 font-medium bg-[#282828]/50 border border-transparent hover:border-[#333]">
                 <Flag className="w-[18px] h-[18px]" />
                 <span className="text-[13px]">Priority {task.priority || 4}</span>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Labels</h3>
              <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-[#2d2d2d] cursor-pointer transition-all text-gray-500 bg-[#282828]/50 border border-transparent hover:border-[#333]">
                 <Tag className="w-[18px] h-[18px]" />
                 <span className="text-[13px]">Add labels</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

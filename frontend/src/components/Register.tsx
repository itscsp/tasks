import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#1e1e1e]">
      <div className="w-full max-w-[420px] bg-[#282828] p-10 rounded-2xl shadow-2xl border border-[#333]">
        <div className="flex items-center justify-center mb-10">
          <div className="w-12 h-12 bg-[#db4c3f] text-white rounded-[14px] shadow-lg flex items-center justify-center font-black text-2xl uppercase tracking-tighter">
            T
          </div>
        </div>

        <h1 className="text-[26px] font-bold text-center text-white mb-2 tracking-tight">Create an account</h1>
        <p className="text-center text-gray-500 text-[13px] mb-8 font-medium">Start managing your tasks effectively</p>
        
        {error && (
          <div className="bg-red-500/10 text-red-400 p-3.5 rounded-xl text-xs mb-8 border border-red-500/20 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-[13px] font-bold text-gray-400 mb-2 uppercase tracking-wider pl-1">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#db4c3f] text-gray-500 transition-colors">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border border-[#333] text-gray-100 rounded-xl focus:ring-2 focus:ring-[#db4c3f]/50 focus:border-[#db4c3f] outline-none transition-all text-sm placeholder:text-gray-600"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-400 mb-2 uppercase tracking-wider pl-1">Email address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#db4c3f] text-gray-500 transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border border-[#333] text-gray-100 rounded-xl focus:ring-2 focus:ring-[#db4c3f]/50 focus:border-[#db4c3f] outline-none transition-all text-sm placeholder:text-gray-600"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-400 mb-2 uppercase tracking-wider pl-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#db4c3f] text-gray-500 transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border border-[#333] text-gray-100 rounded-xl focus:ring-2 focus:ring-[#db4c3f]/50 focus:border-[#db4c3f] outline-none transition-all text-sm placeholder:text-gray-600"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-xl text-sm font-bold text-white bg-[#db4c3f] hover:bg-[#c53727] focus:outline-none focus:ring-4 focus:ring-[#db4c3f]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {loading ? 'Creating account...' : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Sign up
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[13px] text-gray-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#db4c3f] hover:text-[#c53727] font-bold hover:underline transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

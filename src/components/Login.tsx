import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';

export const Login = () => {
// ... existing state ...
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
// ... handleLogin and handleGoogleLogin ...
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.refresh_token, response.data.user);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // In a real scenario, this gets an id_token from Google's OAuth SDK
    alert('Google Login logic to be integrated with official Google SDK.');
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#1e1e1e]">
      <div className="w-full max-w-[400px] bg-[#282828] p-10 rounded-2xl shadow-2xl border border-[#333]">
        <div className="flex items-center justify-center mb-10">
          <div className="w-12 h-12 bg-[#db4c3f] text-white rounded-[14px] shadow-lg flex items-center justify-center font-black text-2xl uppercase tracking-tighter">
            T
          </div>
        </div>

        <h1 className="text-[26px] font-bold text-center text-white mb-8 tracking-tight">Welcome back</h1>
        
        {error && (
          <div className="bg-red-500/10 text-red-400 p-3.5 rounded-xl text-xs mb-8 border border-red-500/20 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
            {loading ? 'Signing in...' : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign in
              </>
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-3 bg-[#282828] text-gray-500 font-bold uppercase tracking-widest">Or continue with</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-3.5 border border-[#333] rounded-xl bg-[#1e1e1e] text-sm font-bold text-gray-200 hover:bg-[#333] hover:text-white transition-all active:scale-95"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[13px] text-gray-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#db4c3f] hover:text-[#c53727] font-bold hover:underline transition-all">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

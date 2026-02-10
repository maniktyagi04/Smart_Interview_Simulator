import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { ShieldCheck } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed';
      setError(message);
    }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const errorParam = params.get('error');

    if (token) {
      localStorage.setItem('sis_token', token);
      window.location.href = '/dashboard'; // Force reload to init auth state
    }
    
    if (errorParam) {
      setError(errorParam);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Content Area (Hero/Promo) */}
      <div className="hidden md:flex md:w-5/12 bg-slate-950 p-12 lg:p-16 flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-6xl font-black text-white tracking-tighter mb-6">
            SIS<span className="text-indigo-500">.</span>
          </h1>
          <h2 className="text-3xl font-bold text-slate-100 mb-6 leading-tight">
            Master your next interview with AI-powered simulation.
          </h2>
          <p className="text-xl text-slate-400 leading-relaxed max-w-md">
            Get access to real-world technical scenarios, instant evaluation, and personalized feedback tailored for top tech roles.
          </p>
        </div>

        <div className="mt-16 flex items-center gap-3 text-slate-500">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-medium">Enterprise-grade security & privacy</span>
        </div>
      </div>

      {/* Right Content Area (Form) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Login to your account</h2>
            <p className="text-slate-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-slate-950 font-bold hover:underline">Sign up</Link>
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <button 
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5005/api'}/auth/google`}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Sign in with Google
            </button>
            <button 
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5005/api'}/auth/facebook`}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700"
            >
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              Sign in with Facebook
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400 font-medium">Or</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:bg-white transition-all"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors underline decoration-dotted underline-offset-4">Forgot Password?</a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:bg-white transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
              <label htmlFor="remember" className="ml-2 text-sm font-medium text-slate-500">Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-xl shadow-slate-900/10"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

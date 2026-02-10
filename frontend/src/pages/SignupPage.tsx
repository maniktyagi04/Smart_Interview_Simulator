import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, type User } from '../store/AuthContext';
import { ShieldCheck } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<Omit<User, 'id'> & { password: string }>({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Content Area (Hero/Promo) */}
      <div className="hidden md:flex md:w-5/12 bg-slate-950 p-12 lg:p-16 flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-6xl font-black text-white tracking-tighter mb-6">
            SIS<span className="text-indigo-500">.</span>
          </h1>
          <h2 className="text-3xl font-bold text-slate-100 mb-6 leading-tight">
            Start your journey toward a top tech career.
          </h2>
          <p className="text-xl text-slate-400 leading-relaxed max-w-md">
            Join thousands of students practicing with our industry-standard interview simulations and expert-curated question banks.
          </p>
        </div>

        <div className="mt-16 flex items-center gap-3 text-slate-500">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-medium">Trusted by engineers at FAANG & Tier-1 startups</span>
        </div>
      </div>

      {/* Right Content Area (Form) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 xl:p-24 bg-white overflow-y-auto">
        <div className="w-full max-w-md my-8">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h2>
            <p className="text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-slate-950 font-bold hover:underline">Log in</Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:bg-white transition-all font-medium"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:bg-white transition-all font-medium"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                  className={`py-3 px-4 rounded-xl border font-bold transition-all ${
                    formData.role === 'STUDENT' 
                    ? 'bg-slate-950 border-slate-950 text-white shadow-lg' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                  className={`py-3 px-4 rounded-xl border font-bold transition-all ${
                    formData.role === 'ADMIN' 
                    ? 'bg-slate-950 border-slate-950 text-white shadow-lg' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed pt-2">
              By creating an account, you agree to our <a href="#" className="underline font-bold text-slate-700">Terms of Service</a> and <a href="#" className="underline font-bold text-slate-700">Privacy Policy</a>.
            </p>

            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-xl shadow-slate-900/10"
            >
              Construct Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">
          S
        </div>
        <span className="text-xl font-bold text-white tracking-tight">SIS</span>
      </Link>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-300">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">{user?.name}</span>
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 capitalize">
            {user?.role.toLowerCase()}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

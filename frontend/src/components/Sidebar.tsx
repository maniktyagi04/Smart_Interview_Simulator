
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Layers, PlayCircle, BookOpen, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-indigo-600 h-screen fixed left-0 top-0 flex flex-col justify-between p-6 shadow-2xl z-50">
      {/* Logo Area */}
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
             <Layers className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">SIS</h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <NavItem icon={<Home size={20} />} label="Dashboard" path="/dashboard" />
          <NavItem icon={<PlayCircle size={20} />} label="Start Interview" path="/interview/new" />
          <NavItem icon={<BookOpen size={20} />} label="Interview History" path="/history" />
          <NavItem icon={<Calendar size={20} />} label="Feedback Reports" path="/feedback-reports" />
          <NavItem icon={<Layers size={20} />} label="Performance Analytics" path="/analytics" />
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-4">
        <div className="bg-indigo-700/50 p-4 rounded-2xl backdrop-blur-sm border border-indigo-500/30">
            <h4 className="text-white font-semibold text-sm mb-1">Exam Starts In</h4>
            <div className="flex gap-2 text-center text-white">
                <TimerBox val="22" label="Days" />
                <TimerBox val="08" label="Hrs" />
                <TimerBox val="15" label="Min" />
            </div>
        </div>
        
        <button 
            onClick={() => navigate('/settings')}
            className={`flex items-center gap-3 transition-colors w-full px-4 py-2 rounded-xl mb-2 ${location.pathname === '/settings' ? 'bg-white text-indigo-600 shadow-lg' : 'text-indigo-200 hover:text-white'}`}
        >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
        </button>
        
        <button onClick={logout} className="flex items-center gap-3 text-indigo-200 hover:text-white transition-colors w-full px-4 py-2">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

import { NavLink } from 'react-router-dom';

const NavItem = ({ icon, label, path }: { icon: React.ReactNode, label: string, path: string }) => {
  return (
    <NavLink 
        to={path} 
        className={({ isActive }) => `
            w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
            ${isActive ? 'bg-white text-indigo-600 shadow-lg' : 'text-indigo-100 hover:bg-indigo-500/50'}
        `}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </NavLink>
  );
};

const TimerBox = ({ val, label }: { val: string, label: string }) => (
    <div className="flex-1 bg-white/10 rounded-lg p-1">
        <div className="font-bold text-lg">{val}</div>
        <div className="text-[10px] opacity-70">{label}</div>
    </div>
)

export default Sidebar;

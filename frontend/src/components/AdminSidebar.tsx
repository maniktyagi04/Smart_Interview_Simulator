import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, FileText, TrendingUp, Activity, Settings, LogOut, Brain } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

import { NavLink } from 'react-router-dom';

const AdminSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: Activity },
        { id: 'questions', label: 'Manage Questions', path: '/admin/questions', icon: FileText },
        { id: 'students', label: 'Manage Students', path: '/admin/students', icon: Users },
        { id: 'sessions', label: 'Interview Sessions', path: '/admin/history', icon: TrendingUp },
        { id: 'insights', label: 'AI Interview Insights', path: '/admin/feedback', icon: Brain },
        { id: 'analytics', label: 'Performance Analytics', path: '/admin/analytics', icon: TrendingUp },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-screen z-50">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
                        <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="text-lg font-bold text-white">SIS</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }: { isActive: boolean }) => `
                                w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                                transition-all duration-200 ease-in-out cursor-pointer
                                relative group
                                ${isActive 
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30' 
                                    : 'text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-purple-600/20'
                                }
                            `}
                        >
                            {({ isActive }: { isActive: boolean }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-0 h-full w-1 bg-indigo-400 rounded-r-full" />
                                    )}
                                    
                                    <Icon 
                                        className={`
                                            w-5 h-5 transition-all duration-200
                                            ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}
                                            group-hover:scale-110
                                        `} 
                                    />
                                    <span className={isActive ? 'font-bold' : 'font-medium'}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-1">
                <button 
                  onClick={() => navigate('/admin/profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group ${location.pathname === '/admin/profile' ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    <Settings className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm font-medium">Settings</span>
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 cursor-pointer group">
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;

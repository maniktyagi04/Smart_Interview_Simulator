
import React from 'react';
import { Search, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

interface DashboardHeaderProps {
    searchValue?: string;
    onSearchChange?: (value: string) => void;
}

const DashboardHeader = ({ searchValue, onSearchChange }: DashboardHeaderProps) => {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    
    return (
        <header className="flex justify-between items-center mb-8 relative z-40">
            <div className="relative">
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-4 hover:bg-slate-100 p-2 rounded-xl transition-colors text-left"
                >
                   {user?.avatar ? (
                       <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover" />
                   ) : (
                       <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl border-2 border-white shadow-md">
                           {user?.name?.[0] || 'U'}
                       </div>
                   )}
                    <div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{user?.name}</p>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Student Dashboard</h2>
                    </div>
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                        <div className="px-4 py-3 border-b border-slate-100 mb-2">
                            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold mt-2 inline-block lowercase">{user?.role}</span>
                        </div>
                        <button 
                            onClick={() => {
                                setIsDropdownOpen(false);
                                window.location.href = '/settings';
                            }}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors"
                        >
                            Profile Settings
                        </button>
                        <button onClick={logout} className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                            Logout
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        value={searchValue}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder="Search topics, categories..." 
                        className="pl-12 pr-4 py-3 min-w-[300px] bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-600"
                    />
                </div>

                <div className="flex gap-3">
                    <IconButton icon={<MessageSquare size={20} />} />
                    <IconButton icon={<Bell size={20} />} hasNotification />
                </div>
            </div>
        </header>
    );
};

const IconButton = ({ icon, hasNotification }: { icon: React.ReactNode, hasNotification?: boolean }) => (
    <button className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all relative">
        {icon}
        {hasNotification && <span className="absolute top-3 right-3 w-2 h-2 bg-red-400 rounded-full border border-indigo-600"></span>}
    </button>
)

export default DashboardHeader;

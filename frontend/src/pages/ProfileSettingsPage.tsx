import React, { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import AdminSidebar from '../components/AdminSidebar';
import { Search, Settings, Check, User, Phone, ArrowRight, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const ProfileSettingsPage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const SidebarComponent = user?.role === 'ADMIN' ? AdminSidebar : Sidebar;
    const [activeTab, setActiveTab] = useState('Profile');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form States
    const [formData, setFormData] = useState({
        name: user?.name || 'John Doe',
        email: user?.email || 'johndoe@example.com',
        phone: '+1 123 456 7890'
    });

    const [imagePreview, setImagePreview] = useState<string | null>(user?.avatar || null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const tabs = ['Profile', 'Account Settings', 'Notifications', 'Privacy'];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSavePhoto = async () => {
        if (!imagePreview) return;
        setIsSaving(true);
        try {
            await updateUser({ avatar: imagePreview });
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save photo", error);
            setIsSaving(false);
        }
    }

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await updateUser({ 
                name: formData.name, 
                email: formData.email 
            });
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update profile", error);
            setIsSaving(false);
        }
    };

    return (
        <div className="flex bg-[#F6F8FF] min-h-screen font-sans text-slate-800">
            <SidebarComponent />
            
            <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-10">
                    
                    {/* Header Section */}
                    <header className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                <Settings size={20} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile Settings</h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="relative group shadow-sm transition-shadow hover:shadow-md rounded-2xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-indigo-600" />
                                <input 
                                    type="text" 
                                    placeholder="Search courses, exams..." 
                                    className="pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100/50 min-w-[320px] transition-all"
                                />
                            </div>
                            <button className="w-10 h-10 bg-[#E0E7FF] text-[#6366F1] rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-all shadow-sm">
                                < ImageIcon size={18} />
                            </button>
                            <button className="w-10 h-10 bg-[#6366F1] text-white rounded-xl flex items-center justify-center hover:bg-[#4F46E5] transition-all shadow-md">
                                <Settings size={18} />
                            </button>
                        </div>
                    </header>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm w-fit">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-[#6366F1] text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Left Column: Profile Info Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm text-center relative overflow-hidden flex flex-col items-center">
                                <h3 className="text-lg font-bold text-slate-900 mb-8 self-start">Profile Information</h3>
                                
                                <div className="relative mb-8">
                                    <div 
                                        onClick={triggerFileInput}
                                        className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 relative group cursor-pointer"
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                                                <User size={64} className="text-indigo-200" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ImageIcon className="text-white" size={24} />
                                        </div>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleImageUpload} 
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                </div>

                                    <div className="flex gap-3 w-full">
                                        <button 
                                            onClick={triggerFileInput}
                                            className="flex-1 py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-sm border border-indigo-100 hover:bg-slate-50 transition-all"
                                        >
                                            Change
                                        </button>
                                        <button 
                                            onClick={handleSavePhoto}
                                            disabled={!imagePreview || imagePreview === user?.avatar || isSaving}
                                            className="flex-1 py-3 bg-[#6366F1] text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-100 hover:bg-[#4F46E5] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                        </div>

                        {/* Right Column: Edit Details Form */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-5 py-3.5 bg-[#F9FBFF] border border-slate-100 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full px-5 py-3.5 bg-[#F9FBFF] border border-slate-100 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Phone Number</label>
                                        <div className="flex rounded-2xl border border-slate-100 bg-[#F9FBFF] overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                            <div className="px-4 flex items-center gap-2 border-r border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                                                <span className="text-lg">🇺🇸</span>
                                                <ChevronDown size={14} className="text-slate-400" />
                                            </div>
                                            <div className="flex-1 flex items-center px-5">
                                                <input 
                                                    type="tel" 
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                    className="bg-transparent focus:outline-none text-slate-900 font-medium w-full py-3.5"
                                                />
                                            </div>
                                            <div className="px-5 flex items-center gap-2 text-[#6366F1]">
                                                <Phone size={18} />
                                                <span className="text-sm font-bold opacity-80">+1 123 456 7890</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-slate-50">
                                    <button className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSaveChanges}
                                        disabled={isSaving}
                                        className="px-8 py-3 bg-[#6366F1] text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-[#4F46E5] transition-all flex items-center gap-2 disabled:opacity-70 min-w-[140px] justify-center"
                                    >
                                        {isSaving ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : showSuccess ? (
                                            <Check size={18} />
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Full Width Bottom: Change Password Card */}
                        <div className="lg:col-span-3">
                            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-8">Change Password</h3>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 ml-1">Current Password</label>
                                            <input 
                                                type="password" 
                                                placeholder="••••••••"
                                                className="w-full px-5 py-3.5 bg-[#F9FBFF] border border-slate-100 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 ml-1">New Password</label>
                                            <input 
                                                type="password" 
                                                placeholder="••••••••"
                                                className="w-full px-5 py-3.5 bg-[#F9FBFF] border border-slate-100 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-bold text-slate-500 ml-1">Confirm New Password</label>
                                            <input 
                                                type="password" 
                                                placeholder="••••••••"
                                                className="w-full px-5 py-3.5 bg-[#F9FBFF] border border-slate-100 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-5">
                                        <div className="bg-slate-50/30 p-6 rounded-3xl border border-slate-100/50 space-y-5">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password must be at least 8 characters:</h4>
                                            <ul className="space-y-4">
                                                <Requirement label="At least 8 characters" checked />
                                                <Requirement label="At least one number" checked />
                                                <Requirement label="A mix of upper & lowercase" checked />
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-10 pt-6 border-t border-slate-50">
                                    <button className="flex items-center gap-2 px-10 py-3.5 bg-[#6366F1] text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-[#4F46E5] hover:-translate-y-0.5 transition-all group">
                                        Update Password
                                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const Requirement = ({ label, checked }: { label: string, checked?: boolean }) => (
    <li className="flex items-center gap-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${checked ? 'bg-[#10B981] text-white shadow-sm' : 'bg-slate-100 text-slate-300'}`}>
            {checked ? <Check size={14} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
        </div>
        <span className={`text-sm font-bold ${checked ? 'text-slate-600' : 'text-slate-400'}`}>{label}</span>
    </li>
);

export default ProfileSettingsPage;

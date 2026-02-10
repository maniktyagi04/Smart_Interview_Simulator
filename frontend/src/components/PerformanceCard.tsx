
import React from 'react';

interface PerformanceCardProps {
    title: string;
    value: string | number;
    subtext?: string;
    icon: React.ReactNode;
    color: string;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ title, value, subtext, icon, color }) => {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-4 opacity-10 text-slate-900`}>
                {/* Background icon effect */}
            </div>
            
            <div className="flex justify-between items-start z-10">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} text-white shadow-md`}>
                    {icon}
                </div>
            </div>
            
            {subtext && <p className="text-xs font-medium text-slate-500 mt-2 z-10">{subtext}</p>}
        </div>
    );
};

export default PerformanceCard;

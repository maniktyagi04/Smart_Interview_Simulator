
import React from 'react';
import { Play } from 'lucide-react';

interface CourseCardProps {
    title: string;
    description: string;
    progress: number;
    color: string;
    image: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ title, description, progress, color, image }) => {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className={`h-32 w-full rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center ${color}`}>
        {/* Abstract shapes or image */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <img src={image} alt="" className="w-16 h-16 object-contain z-10 opacity-90 drop-shadow-lg" />
      </div>

      <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{title}</h3>
      <p className="text-slate-500 text-xs mb-4">{description}</p>

      <div className="mt-auto">
        <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
                <Play size={12} className="fill-slate-700" />
                <span>35 Tutorials</span>
            </div>
            <span>{progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

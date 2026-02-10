
import React from 'react';
import { Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Recommendation {
    domain: string;
    difficulty: string;
    reason: string;
}

const RecommendationBox: React.FC<{ recommendation: Recommendation }> = ({ recommendation }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col justify-between h-full group">
            {/* Abstract Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-all duration-700"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <Target className="text-white" size={20} />
                    </div>
                    <span className="text-xs font-bold bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full uppercase tracking-wider">Recommended</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-1">Master {recommendation.domain.replace('_', ' ')}</h3>
                <p className="text-indigo-200 text-sm mb-6">{recommendation.reason}</p>
                
                <div className="flex gap-2 mb-6">
                    <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded-lg border border-white/10">{recommendation.difficulty}</span>
                    <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded-lg border border-white/10">30 Mins</span>
                </div>
            </div>

            <button 
                onClick={() => navigate('/interview/new')}
                className="relative z-10 w-full bg-white text-indigo-900 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg shadow-indigo-900/50"
            >
                Start Focused Session <ArrowRight size={16} />
            </button>
        </div>
    );
};

export default RecommendationBox;

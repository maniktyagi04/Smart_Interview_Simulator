
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Concept {
    concept: string;
    score: number;
}

const WeakConcepts: React.FC<{ concepts: Concept[] }> = ({ concepts }) => {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
            <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="text-orange-500" size={20} />
                <h3 className="font-bold text-slate-800 text-lg">Concepts to Improve</h3>
            </div>

            <div className="space-y-4">
                {concepts.length === 0 ? (
                    <p className="text-sm text-slate-400">No data available yet.</p>
                ) : (
                    concepts.map((item, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-600">{item.concept}</span>
                                <span className="text-orange-500">{Math.round(item.score)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full" 
                                    style={{ width: `${item.score}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WeakConcepts;

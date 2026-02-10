import { ChevronDown } from 'lucide-react';

const StatChart = () => {
    // Mock chart visual using CSS gradients/shapes for simplicity
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="font-bold text-slate-800 text-lg">Interview Score Trend</h3>
                   <p className="text-slate-400 text-xs text-indigo-500 font-bold">Rolling Average (Last 10)</p>
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    Yearly <ChevronDown size={14} />
                </button>
            </div>

            <div className="flex-1 relative flex items-end justify-between gap-2 px-2 pb-6 w-full h-full min-h-[200px] overflow-hidden">
                {/* Y-Axis Labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-slate-300 font-medium z-10 bg-white/50 backdrop-blur-[1px]">
                    <span>10</span>
                    <span>8</span>
                    <span>6</span>
                    <span>4</span>
                    <span>2</span>
                    <span>0</span>
                </div>

                {/* Graph Area */}
                <div className="ml-8 w-full h-full relative">
                     {/* Gradient Area (simulated graph) */}
                     <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
                         <defs>
                             <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{stopColor:'rgb(99, 102, 241)', stopOpacity:0.5}} />
                                <stop offset="100%" style={{stopColor:'rgb(99, 102, 241)', stopOpacity:0}} />
                             </linearGradient>
                         </defs>
                         <path d="M0,40 Q10,35 20,45 T40,20 T60,35 T80,10 T100,30 V50 H0 Z" fill="url(#grad1)" stroke="none" />
                         <path d="M0,40 Q10,35 20,45 T40,20 T60,35 T80,10 T100,30" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                         
                         {/* Highlight Point */}
                         <circle cx="40" cy="20" r="2" fill="#1E1B4B" stroke="white" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                     </svg>
                     
                     {/* Tooltip Simulation */}
                     <div className="hidden group-hover:block absolute top-[20%] left-[35%] bg-[#1E1B4B] text-white text-[10px] py-1 px-3 rounded-lg shadow-xl translate-x-[-50%] pointer-events-none z-20">
                         Highest
                         <div className="font-bold text-sm">7.8</div>
                         <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1E1B4B] rotate-45"></div>
                     </div>
                </div>
            </div>
            
            <div className="ml-8 flex justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
        </div>
    );
};

export default StatChart;

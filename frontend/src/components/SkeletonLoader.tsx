import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({ className = "h-4 w-full", count = 1 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={`bg-slate-800/50 rounded ${className}`} 
        />
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-slate-800">
                <SkeletonLoader className="h-8 w-48" />
                <SkeletonLoader className="h-8 w-32" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-800/50">
                    <SkeletonLoader className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <SkeletonLoader className="h-4 w-1/3" />
                        <SkeletonLoader className="h-3 w-1/4" />
                    </div>
                    <SkeletonLoader className="h-8 w-24" />
                </div>
            ))}
        </div>
    )
}

export const CardSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    {/* Background Icon Placeholder */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <div className="w-28 h-28 bg-indigo-200 rounded-full" />
                    </div>
                    
                    {/* Header with badge and date */}
                    <div className="flex justify-between items-start mb-6 animate-pulse">
                        <div className="h-8 w-32 rounded-xl bg-slate-100" />
                        <div className="h-5 w-24 rounded bg-slate-100" />
                    </div>

                    {/* Title */}
                    <div className="mb-2 animate-pulse">
                        <div className="h-8 w-3/4 rounded bg-slate-100" />
                    </div>
                    
                    {/* Verdict/Score */}
                    <div className="flex items-center gap-2 mb-8 animate-pulse">
                        <div className="h-5 w-16 rounded bg-slate-100" />
                        <div className="h-6 w-24 rounded bg-slate-100" />
                    </div>

                    {/* Button */}
                    <div className="animate-pulse">
                        <div className="h-6 w-40 rounded bg-slate-100" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default SkeletonLoader;

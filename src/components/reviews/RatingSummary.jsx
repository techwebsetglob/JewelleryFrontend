import React from 'react';
import StarRating from './StarRating';

const RatingSummary = ({ summary, activeFilter, onFilterChange }) => {
  const { average = 0, total = 0, breakdown = {} } = summary || {};

  const handleFilterClick = (stars) => {
    // Toggle filter off if already active
    if (activeFilter === stars) {
      onFilterChange(null);
    } else {
      onFilterChange(stars);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start md:items-center bg-white/5 border border-primary/10 rounded-2xl p-8 mb-12">
      
      {/* Average Display */}
      <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-auto">
        <h3 className="font-serif text-6xl text-primary font-bold mb-2">
          {average > 0 ? average.toFixed(1) : '0.0'}
        </h3>
        <div className="mb-2">
          <StarRating value={average} size="md" />
        </div>
        <p className="text-sm text-slate-100/60 uppercase tracking-widest text-[10px]">
          {total} {total === 1 ? 'Review' : 'Reviews'}
        </p>
      </div>

      <div className="w-px h-24 bg-primary/10 hidden md:block shrink-0"></div>

      {/* Breakdown Bars */}
      <div className="flex-1 w-full flex flex-col gap-2 relative z-10">
        {[5, 4, 3, 2, 1].map(stars => {
          const count = breakdown[stars] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const isActive = activeFilter === stars;

          return (
            <button 
              key={stars}
              onClick={() => handleFilterClick(stars)}
              className={`flex items-center gap-4 w-full group transition-opacity ${
                activeFilter && !isActive ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div className="flex items-center gap-1 w-8 shrink-0 justify-end">
                <span className="text-[10px] text-white font-bold">{stars}</span>
                <span className="material-symbols-outlined text-primary text-[10px]">star</span>
              </div>
              
              <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden relative">
                <div 
                  className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-1000 ${
                    isActive ? 'bg-white' : 'bg-primary'
                  } group-hover:bg-white`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="w-8 shrink-0 text-left">
                <span className="text-[10px] text-slate-100/60">{count}</span>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default RatingSummary;

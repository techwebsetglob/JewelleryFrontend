import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ value = 0, interactive = false, onChange, size = 'md', className = '' }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    sm: 14,
    md: 18,
    lg: 24
  };

  const starSize = sizes[size] || sizes.md;

  const handleKeyDown = (e, index) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(index);
    }
  };

  const renderStar = (index) => {
    const isInteractive = interactive;
    const currentValue = isInteractive ? (hoverValue || value) : value;

    // Check if we need a half star (only applies if not interactive and value is a decimal like 4.5)
    // If the star index is precisely the ceiling of the value and the value isn't an integer.
    const isHalf = !isInteractive && currentValue > index - 1 && currentValue < index;
    const isFilled = currentValue >= index;

    let StarComponent = Star;
    if (isHalf) StarComponent = StarHalf;

    const baseClasses = `transition-colors duration-200 ${
      isInteractive ? 'cursor-pointer hover:scale-110' : ''
    }`;

    // Aurum uses text-primary for gold
    const colorClasses = isFilled || isHalf 
      ? 'fill-primary text-primary' 
      : 'text-white/20 fill-white/5';

    return (
      <div 
        key={index}
        className={`${baseClasses} ${colorClasses} focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-sm`}
        role={isInteractive ? 'button' : 'img'}
        tabIndex={isInteractive ? 0 : -1}
        aria-label={`${index} Star`}
        onMouseEnter={() => isInteractive && setHoverValue(index)}
        onMouseLeave={() => isInteractive && setHoverValue(0)}
        onClick={() => isInteractive && onChange(index)}
        onKeyDown={(e) => handleKeyDown(e, index)}
      >
        <StarComponent size={starSize} />
      </div>
    );
  };

  return (
    <div className={`flex items-center gap-1 ${className}`} onMouseLeave={() => interactive && setHoverValue(0)}>
      {[1, 2, 3, 4, 5].map((index) => renderStar(index))}
    </div>
  );
};

export default StarRating;

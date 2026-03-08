import React, { useState } from 'react';
import StarRating from './StarRating';
import { ThumbsUp, Flag, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

const ReviewCard = ({ review, currentUser, onEdit, onDelete, onMarkHelpful, onReport }) => {
  const [expanded, setExpanded] = useState(false);

  const isOwner = currentUser?.uid === review.userId;
  const isHelpfulHovered = review.helpful?.includes(currentUser?.uid); // checking logic if clicked
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    // handle firestore timestamp vs native date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(date);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const bodyPreview = review.body?.length > 150 
    ? review.body.slice(0, 150) + '...'
    : review.body;
    
  return (
    <div className="py-8 border-b border-primary/10 last:border-0 hover:bg-white/[0.02] transition-colors -mx-6 px-6 rounded-lg group">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
        
        {/* Avatar Area */}
        <div className="flex gap-4 sm:flex-col sm:w-48 shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-primary/20 flex items-center justify-center shrink-0">
            {review.userAvatar ? (
              <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-lg text-primary">{getInitials(review.userName)}</span>
            )}
          </div>
          <div className="flex flex-col justify-center sm:justify-start">
            <span className="text-white text-sm font-medium mb-1 truncate block max-w-full">
              {review.userName || 'Verified Client'}
            </span>
            {review.verified && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary font-bold">
                <CheckCircle2 size={10} className="text-primary translate-y-[0.5px]" /> 
                Verified Purchase
              </span>
            )}
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <StarRating value={review.rating} size="sm" />
            <span className="text-slate-100/40 text-[10px] uppercase tracking-widest pl-4 shrink-0">
              {formatDate(review.createdAt)}
            </span>
          </div>

          <h4 className="font-serif text-lg text-white mb-2 line-clamp-2">{review.title}</h4>
          
          <div className="text-sm text-slate-100/70 leading-relaxed font-light mb-4 break-words">
            {expanded ? review.body : bodyPreview}
            {review.body?.length > 150 && (
              <button 
                onClick={() => setExpanded(!expanded)}
                className="ml-2 text-primary hover:text-white transition-colors text-xs font-bold"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-4 mt-6 border-t border-primary/10 pt-4">
            <button 
              onClick={() => onMarkHelpful(review.id)}
              className={`flex items-center gap-2 text-xs uppercase tracking-widest font-bold transition-colors ${
                isHelpfulHovered ? 'text-primary' : 'text-slate-100/40 hover:text-white'
              }`}
            >
              <ThumbsUp size={14} className={isHelpfulHovered ? 'fill-primary' : ''} />
              Helpful ?
              <span className="ml-1 opacity-60">({review.helpful?.length || 0})</span>
            </button>

            {!isOwner && !review.reported && (
              <button 
                onClick={() => onReport(review.id)}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-100/20 hover:text-red-400 transition-colors ml-auto md:opacity-0 group-hover:opacity-100"
              >
                <Flag size={12} />
                Report
              </button>
            )}

            {isOwner && (
              <div className="flex items-center gap-4 ml-auto">
                <button 
                  onClick={() => onEdit(review)}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button 
                  onClick={() => onDelete(review.id)}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-slate-100/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReviewCard;

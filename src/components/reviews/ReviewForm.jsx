import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { reviewSchema } from '../../security/validate';
import { sanitizeObject } from '../../security/sanitize';

const ReviewForm = ({ initialData, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating || 0);
      setTitle(initialData.title || '');
      setBody(initialData.body || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // 1. Zod validation
    const result = reviewSchema.safeParse({ rating, title, body });
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // 2. Sanitize before submission
    const cleanData = sanitizeObject(result.data);
    // Keep rating as number (sanitizeObject only touches strings)
    onSubmit({ ...cleanData, rating: result.data.rating });
  };

  return (
    <div className="bg-black/40 border border-primary/20 p-6 md:p-8 rounded-2xl mb-12 animate-slide-down">
      <h3 className="font-serif text-2xl text-primary mb-6 border-b border-primary/20 pb-4">
        {initialData ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Rating */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Overall Rating <span className="text-primary">*</span></label>
          <div className="bg-white/5 inline-flex p-4 rounded-lg border border-white/5 w-max">
            <StarRating 
              interactive={true} 
              value={rating} 
              onChange={(val) => { setRating(val); setErrors({...errors, rating: null}); }} 
              size="lg" 
            />
          </div>
          {errors.rating && <p className="text-red-400 text-xs pl-1">{errors.rating}</p>}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end pl-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-100/60">Review Headline <span className="text-primary">*</span></label>
            <span className={`text-[10px] ${title.length > 80 ? 'text-red-400' : 'text-slate-100/40'}`}>
              {title.length}/80
            </span>
          </div>
          <input 
            type="text" 
            maxLength={80}
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors({...errors, title: null}); }}
            placeholder="Sum up your experience"
            className={`w-full bg-black/40 border ${errors.title ? 'border-red-500/50' : 'border-primary/20 focus:border-primary/60'} rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors`}
          />
          {errors.title && <p className="text-red-400 text-xs pl-1">{errors.title}</p>}
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end pl-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-100/60">Your Review <span className="text-primary">*</span></label>
            <span className={`text-[10px] ${body.length > 500 ? 'text-red-400' : body.length < 20 ? 'text-amber-500/70' : 'text-slate-100/40'}`}>
              {body.length}/500 (Min 20)
            </span>
          </div>
          <textarea 
            rows={5}
            maxLength={500}
            value={body}
            onChange={(e) => { setBody(e.target.value); setErrors({...errors, body: null}); }}
            placeholder="What did you like or dislike? How's the craftsmanship?"
            className={`w-full bg-black/40 border ${errors.body ? 'border-red-500/50' : 'border-primary/20 focus:border-primary/60'} rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors resize-none`}
          />
          {errors.body && <p className="text-red-400 text-xs pl-1">{errors.body}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-primary/10">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded text-[10px] uppercase tracking-widest font-bold text-slate-100/60 bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex-[2] py-3 rounded text-[10px] uppercase tracking-widest font-bold text-black bg-primary hover:bg-white transition-colors"
          >
            {initialData ? 'Update Review' : 'Post Review'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ReviewForm;

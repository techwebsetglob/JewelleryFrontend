import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReviews } from '../../hooks/useReviews';

import RatingSummary from './RatingSummary';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const ReviewSection = ({ productId }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const {
    reviews,
    loading,
    hasMore,
    loadMore,
    submitReview,
    deleteReview,
    markHelpful,
    reportReview,
    userReview,
    summary,
    setReviews // we'll use this for local sorting if we want, but usually it's best to re-fetch or sort locally.
  } = useReviews(productId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'highest', 'helpful', 'lowest'

  const handleWriteClick = () => {
    if (!currentUser) {
      navigate(`/login?redirect=/shop/${productId}`);
      return;
    }
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    await submitReview(data);
    setIsFormOpen(false);
  };

  // Client-side filtering and sorting for display
  const getDisplayedReviews = () => {
    let filtered = [...reviews];

    // Filter by star rating
    if (activeFilter) {
      filtered = filtered.filter(r => r.rating === activeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          const aHelpful = a.helpful?.length || 0;
          const bHelpful = b.helpful?.length || 0;
          return bHelpful - aHelpful;
        case 'recent':
        default:
          const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
          const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
          // Fallback if not server timestamp yet
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateB - dateA;
      }
    });

    return filtered;
  };

  const displayedReviews = getDisplayedReviews();

  if (loading && reviews.length === 0) {
    return (
      <div className="py-20 flex justify-center text-primary">
        <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
      </div>
    );
  }

  return (
    <section className="py-16 md:py-24 border-t border-primary/20">
      <div className="mb-12">
        <h2 className="font-serif text-3xl md:text-4xl text-primary mb-2">Client Reviews</h2>
        <p className="text-slate-100/60 text-sm">Real experiences from verified purchasers.</p>
      </div>

      <RatingSummary 
        summary={summary} 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 mt-12">
        {!isFormOpen && (
          <button 
            onClick={handleWriteClick}
            className="btn-lux-primary py-3 px-8 rounded text-xs uppercase tracking-[0.1em] font-bold text-black"
          >
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </button>
        )}
        
        <div className={`flex items-center gap-4 ${isFormOpen ? 'ml-auto' : ''}`}>
          <label className="text-[10px] uppercase tracking-widest text-slate-100/40">Sort By</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border border-primary/20 rounded px-4 py-2 text-xs text-white focus:outline-none focus:border-primary/60"
          >
            <option value="recent" className="bg-background-dark">Most Recent</option>
            <option value="highest" className="bg-background-dark">Highest Rated</option>
            <option value="lowest" className="bg-background-dark">Lowest Rated</option>
            <option value="helpful" className="bg-background-dark">Most Helpful</option>
          </select>
        </div>
      </div>

      {isFormOpen && (
        <ReviewForm 
          initialData={userReview}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {/* Reviews List */}
      <div className="flex flex-col">
        {displayedReviews.length === 0 ? (
          <div className="py-16 text-center text-slate-100/40 border border-t-0 border-primary/5 rounded-b-xl px-6">
            {activeFilter ? `No ${activeFilter}-star reviews yet.` : 'No reviews yet. Be the first to review!'}
          </div>
        ) : (
          displayedReviews.map(review => (
            <ReviewCard 
              key={review.id}
              review={review}
              currentUser={currentUser}
              onEdit={() => setIsFormOpen(true)}
              onDelete={deleteReview}
              onMarkHelpful={markHelpful}
              onReport={reportReview}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && !activeFilter && (
        <div className="flex justify-center mt-12">
          <button 
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 rounded text-[10px] uppercase tracking-widest font-bold border border-primary/30 text-primary hover:bg-white/5 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : 'Load More Reviews'}
          </button>
        </div>
      )}
      
    </section>
  );
};

export default ReviewSection;

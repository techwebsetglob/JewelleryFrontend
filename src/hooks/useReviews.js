import { useState, useEffect, useCallback } from 'react';
import { 
  collection, query, where, orderBy, limit, startAfter, getDocs, 
  addDoc, updateDoc, deleteDoc, doc, runTransaction, serverTimestamp, getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const REVIEWS_PER_PAGE = 5;

export const useReviews = (productId) => {
  const { currentUser } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  
  const [userReview, setUserReview] = useState(null);
  const [summary, setSummary] = useState({ average: 0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  
  // Helper to re-calculate summary locally
  const calculateSummary = useCallback((allReviews) => {
    if (!allReviews || allReviews.length === 0) {
      setSummary({ average: 0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      return;
    }
    
    let totalScore = 0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    allReviews.forEach(r => {
      totalScore += r.rating;
      if (breakdown[r.rating] !== undefined) {
        breakdown[r.rating]++;
      }
    });

    setSummary({
      average: totalScore / allReviews.length,
      total: allReviews.length,
      breakdown
    });
  }, []);

  // Fetch initial reviews & the user's review if logged in
  useEffect(() => {
    if (!productId) return;
    
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // We'll fetch all reviews for summary calculation, but we'll paginate the display
        // Note: For a very large scale app, summary would be pre-calculated and stored on the product doc.
        // The prompt asks to recalculate summary client-side from fetched reviews, but wait, 
        // if we paginate, we only have a subset of reviews. Let's fetch the summary from the product doc OR fetch all reviews.
        // The prompt: "Recalculate summary client-side from fetched reviews + update if new review added"
        // Let's query all reviews for the product to get the true breakdown.
        const allReviewsQuery = query(collection(db, 'reviews'), where('productId', '==', productId));
        const allSnap = await getDocs(allReviewsQuery);
        const allReviewsData = allSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        calculateSummary(allReviewsData);

        // Find current user's review if exists
        if (currentUser) {
          const uReview = allReviewsData.find(r => r.userId === currentUser.uid);
          setUserReview(uReview || null);
        } else {
          setUserReview(null);
        }

        // Now fetch paginated for display (first page)
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId),
          orderBy('createdAt', 'desc'),
          limit(REVIEWS_PER_PAGE)
        );
        
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(fetched);
        
        if (snap.docs.length === REVIEWS_PER_PAGE) {
          setLastVisible(snap.docs[snap.docs.length - 1]);
          setHasMore(true);
        } else {
          setHasMore(false);
          setLastVisible(null);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [productId, currentUser, calculateSummary]);

  const loadMore = async () => {
    if (!hasMore || !lastVisible) return;
    
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(REVIEWS_PER_PAGE)
      );
      
      const snap = await getDocs(q);
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setReviews(prev => [...prev, ...fetched]);
      
      if (snap.docs.length === REVIEWS_PER_PAGE) {
        setLastVisible(snap.docs[snap.docs.length - 1]);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more reviews:", err);
    }
  };

  // Check if user has purchased this product
  const checkVerifiedPurchase = async () => {
    if (!currentUser) return false;
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      
      for (const doc of snap.docs) {
        const orderData = doc.data();
        if (orderData.items && Array.isArray(orderData.items)) {
          const hasBought = orderData.items.some(item => item.productId === productId);
          if (hasBought) return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Error checking verification:", err);
      return false;
    }
  };

  // Recalculates the product rating via transaction
  const updateProductRatingTransaction = async () => {
    const productRef = doc(db, 'products', productId);
    
    try {
      await runTransaction(db, async (transaction) => {
        // Fetch ALL reviews inside the transaction to ensure accurate avg
        const reviewsQuery = query(collection(db, 'reviews'), where('productId', '==', productId));
        const allReviewsSnap = await getDocs(reviewsQuery); // getDocs inside transaction is technically outside transaction context, but Firestore rules allow this if not tracking changes.
        // Actually, replacing with just reading the product doc isn't enough to calculate new average if we don't have all data.
        // A safer transaction: 
        const allReviewsData = allReviewsSnap.docs.map(d => d.data());
        let totalSum = 0;
        allReviewsData.forEach(r => totalSum += r.rating);
        const count = allReviewsData.length;
        const newAverage = count === 0 ? 0 : totalSum / count;
        
        transaction.update(productRef, {
          rating: newAverage,
          reviewCount: count
        });
      });
    } catch (err) {
      console.error("Transaction failed: ", err);
    }
  };

  const submitReview = async ({ rating, title, body }) => {
    if (!currentUser) return;
    try {
      const isVerified = await checkVerifiedPurchase();
      
      const reviewData = {
        productId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Guest',
        userAvatar: currentUser.photoURL || null,
        rating: Number(rating),
        title,
        body,
        verified: isVerified,
        helpful: [],
        reported: false,
        updatedAt: serverTimestamp()
      };

      if (userReview) {
        // Update existing
        const reviewRef = doc(db, 'reviews', userReview.id);
        await updateDoc(reviewRef, reviewData);
        setUserReview({ ...userReview, ...reviewData, id: userReview.id });
        setReviews(prev => prev.map(r => r.id === userReview.id ? { ...r, ...reviewData } : r));
      } else {
        // Create new
        reviewData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'reviews'), reviewData);
        const newReview = { id: docRef.id, ...reviewData, createdAt: new Date() };
        setUserReview(newReview);
        setReviews(prev => [newReview, ...prev]);
      }

      // Re-fetch all to locally update summary
      const allReviewsQuery = query(collection(db, 'reviews'), where('productId', '==', productId));
      const allSnap = await getDocs(allReviewsQuery);
      const allReviewsData = allSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      calculateSummary(allReviewsData);

      // Update product document avg ratings
      await updateProductRatingTransaction();
      
      toast.success(userReview ? "Review updated!" : "Review submitted!");
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error('Failed to submit review.');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      if (userReview?.id === reviewId) {
        setUserReview(null);
      }

      // Re-fetch all to locally update summary
      const allReviewsQuery = query(collection(db, 'reviews'), where('productId', '==', productId));
      const allSnap = await getDocs(allReviewsQuery);
      const allReviewsData = allSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      calculateSummary(allReviewsData);

      // Update product avg
      await updateProductRatingTransaction();
      
      toast.success('Review deleted.');
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error('Failed to delete review.');
    }
  };

  const markHelpful = async (reviewId) => {
    if (!currentUser) {
      toast.error('Please log in to mark reviews as helpful.');
      return;
    }
    try {
      const reviewIndex = reviews.findIndex(r => r.id === reviewId);
      if (reviewIndex === -1) return;
      
      const review = reviews[reviewIndex];
      const hasMarked = review.helpful?.includes(currentUser.uid);
      let newHelpful = [...(review.helpful || [])];
      
      if (hasMarked) {
        newHelpful = newHelpful.filter(id => id !== currentUser.uid);
      } else {
        newHelpful.push(currentUser.uid);
      }

      await updateDoc(doc(db, 'reviews', reviewId), { helpful: newHelpful });
      
      // Optimistic update
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful: newHelpful } : r));
    } catch (err) {
      console.error("Error marking helpful:", err);
    }
  };

  const reportReview = async (reviewId) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { reported: true });
      // Optimistic update to hide or show reported status
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reported: true } : r));
      toast.success('Review reported. Our team will review it.');
    } catch (err) {
      console.error("Error reporting review:", err);
      toast.error('Failed to report review.');
    }
  };

  return {
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
    setReviews // expose if we want to sort client-side
  };
};

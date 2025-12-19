"use client";

import { useState, useCallback } from 'react';
import type { Review, ReviewFormData } from '@/types/review';

interface UseReviewsProps {
  productId: number;
  orderId?: number;
  sessionId: string;
}

interface UseReviewsReturn {
  review: Review | null;
  isLoading: boolean;
  error: string | null;
  submitReview: (formData: ReviewFormData) => Promise<boolean>;
  deleteReview: () => Promise<boolean>;
  refreshReview: () => Promise<void>;
}

export function useReviews({ productId, orderId, sessionId }: UseReviewsProps): UseReviewsReturn {
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshReview = useCallback(async () => {
    // No API call - just set loading to false
    setIsLoading(false);
    setError(null);
  }, []);

  const submitReview = useCallback(async (formData: ReviewFormData): Promise<boolean> => {
    // No API call - just simulate success
    setError(null);
    
    // Create a mock review for UI purposes
    const mockReview: Review = {
      reviewId: Date.now(),
      sessionId,
      rating: formData.rating,
      comment: formData.comment,
      productId,
      orderId,
      createdAt: new Date().toISOString(),
    };
    
    setReview(mockReview);
    return true;
  }, [sessionId, productId, orderId]);

  const deleteReview = useCallback(async (): Promise<boolean> => {
    if (!review) return false;

    try {
      // In a real implementation, you would call a delete API endpoint
      // For now, we'll just clear the local state
      setReview(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      return false;
    }
  }, [review]);

  // Initialize without API call
  useState(() => {
    setIsLoading(false);
  });

  return {
    review,
    isLoading,
    error,
    submitReview,
    deleteReview,
    refreshReview,
  };
}
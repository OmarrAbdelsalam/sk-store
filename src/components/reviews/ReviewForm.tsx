"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import type { Review, ReviewFormData } from '@/types/review';

interface ReviewFormProps {
  productId: number | string;
  orderId?: number | string;
  sessionId: string;
  existingReview?: Review | null;
  onReviewSubmitted: (review: Review) => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  orderId,
  sessionId,
  existingReview,
  onReviewSubmitted,
  onCancel,
}) => {
  const t = useTranslations('Reviews');
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: existingReview?.rating || 0,
    comment: existingReview?.comment || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    setError(null);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      setError(t('selectRating'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create a mock review for UI purposes (no API call)
      const mockReview: Review = {
        reviewId: existingReview?.reviewId || Date.now(),
        sessionId,
        rating: formData.rating,
        comment: formData.comment.trim(),
        productId,
        orderId,
        createdAt: existingReview?.createdAt || new Date().toISOString(),
        updatedAt: existingReview ? new Date().toISOString() : undefined,
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onReviewSubmitted(mockReview);
    } catch (error) {
      setError(t('submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {existingReview ? t('yourReview') : t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('rating')} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="p-1 hover:scale-110 transition-transform"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              {t('comment')} <span className="text-gray-500">({t('optional')})</span>
            </label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={handleCommentChange}
              placeholder={t('commentPlaceholder')}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              className="min-w-[120px]"
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ReviewForm from './ReviewForm';
import ReviewDisplay from './ReviewDisplay';
import type { Review } from '@/types/review';

interface ReviewSectionProps {
  productId: number;
  orderId?: number;
  sessionId: string;
  className?: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  productId,
  orderId,
  sessionId,
  className = '',
}) => {
  const t = useTranslations('Reviews');
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize without API call
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleReviewSubmitted = (newReview: Review) => {
    setReview(newReview);
    setShowForm(false);
    setIsEditing(false);
  };

  const handleAddReview = () => {
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditReview = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteReview = async () => {
    // In a real implementation, you would call a delete API
    // For now, we'll just clear the local state
    setReview(null);
    setShowForm(false);
    setIsEditing(false);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        {!review && !showForm && (
          <Button
            onClick={handleAddReview}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('addReview')}
          </Button>
        )}
      </div>

      {showForm ? (
        <ReviewForm
          productId={productId}
          orderId={orderId}
          sessionId={sessionId}
          existingReview={isEditing ? review : null}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={handleCancelForm}
        />
      ) : review ? (
        <div className="space-y-4">
          <ReviewDisplay
            review={review}
            canEdit={true}
            canDelete={true}
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
          />
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <p className="font-medium mb-1">{t('yourReview')}</p>
            <p>
              You can edit or delete your review at any time. 
              Each product in an order can have only one review.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            Share your experience with this product to help other customers make informed decisions.
          </p>
          <Button onClick={handleAddReview} className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            {t('addReview')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getOrCreateSessionId } from "@/lib/session";
import { API_ROUTES } from "@/lib/api-routes";

type ReviewDialogProps = {
  orderItemId: number;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewSubmitted?: () => void;
  existingReview?: {
    id: number;
    rating: number;
    comment: string | null;
  } | null;
};

export function ReviewDialog({
  orderItemId,
  productName,
  open,
  onOpenChange,
  onReviewSubmitted,
  existingReview,
}: ReviewDialogProps) {
  const t = useTranslations("Reviews");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(t("selectRating"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const sessionId = getOrCreateSessionId();
      
      if (isEditing && existingReview) {
        // Update existing review using PUT
        const response = await fetch(API_ROUTES.reviews.update(existingReview.id), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewId: existingReview.id,
            sessionId,
            rating,
            comment: comment.trim() || null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update review");
        }
      } else {
        // Create new review using POST
        const response = await fetch(API_ROUTES.reviews.create(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderItemId,
            sessionId,
            rating,
            comment: comment.trim() || null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit review");
        }
      }

      // Reset form only if creating new review
      if (!isEditing) {
        setRating(0);
        setComment("");
      }
      onOpenChange(false);
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(isEditing ? t("updateError") : t("submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir={isAr ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{isEditing ? t("editTitle") : t("title")}</DialogTitle>
          <DialogDescription>{productName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="ds-label block text-ink">{t("rating")}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`${star} / 5`}
                  aria-pressed={rating >= star}
                  className="transition-opacity duration-fast hover:opacity-60"
                >
                  <Star
                    strokeWidth={1.25}
                    className={`h-7 w-7 ${
                      star <= (hoveredRating || rating)
                        ? "fill-ink text-ink"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="ds-label block text-ink">
              {t("comment")} <span className="text-gray-500">({t("optional")})</span>
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("commentPlaceholder")}
              rows={4}
              maxLength={500}
            />
            <p className="ds-fine text-end">
              {comment.length}/500
            </p>
          </div>

          {error && (
            <div className="border border-danger bg-background p-3 text-fine text-danger">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting 
                ? (isEditing ? t("updating") : t("submitting"))
                : (isEditing ? t("update") : t("submit"))
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

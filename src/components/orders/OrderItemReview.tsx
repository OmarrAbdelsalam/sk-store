"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Star, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewDialog } from "./ReviewDialog";
import { getOrCreateSessionId } from "@/lib/session";
import { API_ROUTES } from "@/lib/api-routes";


type OrderItemReviewProps = {
  orderItemId: number;
  productId: number;
  productName: string;
  sessionId: string;
  onReviewChange?: () => void;
};

export function OrderItemReview({
  orderItemId,
  productId,
  productName,
  sessionId,
  onReviewChange,
}: OrderItemReviewProps) {
  const t = useTranslations("Reviews");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const [existingReview, setExistingReview] = useState<{
    id: number;
    rating: number;
    comment: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has already reviewed this product
  useEffect(() => {
    const checkExistingReview = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_ROUTES.products.byId(productId));
        
        if (response.ok) {
          const result = await response.json();
          if (result.succeeded && result.data.reviews) {
            // Find review by current user's sessionId
            const userReview = result.data.reviews.find(
              (review: any) => review.sessionId === sessionId
            );
            
            if (userReview) {
              setExistingReview({
                id: userReview.id,
                rating: userReview.rating,
                comment: userReview.comment,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error checking existing review:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingReview();
  }, [productId, sessionId]);



  const handleReviewSubmitted = () => {
    setShowReviewDialog(false);
    // Refresh the review data
    const checkExistingReview = async () => {
      try {
        const response = await fetch(API_ROUTES.products.byId(productId));
        
        if (response.ok) {
          const result = await response.json();
          if (result.succeeded && result.data.reviews) {
            const userReview = result.data.reviews.find(
              (review: any) => review.sessionId === sessionId
            );
            
            if (userReview) {
              setExistingReview({
                id: userReview.id,
                rating: userReview.rating,
                comment: userReview.comment,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error refreshing review:", error);
      }
    };

    checkExistingReview();
    if (onReviewChange) {
      onReviewChange();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-3 bg-muted/50 rounded-lg border">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">
          {t("checkingReview")}
        </span>
      </div>
    );
  }

  if (existingReview) {
    return (
      <>
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= existingReview.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{t("yourReview")}</span>
            </div>
            {existingReview.comment && (
              <p className="text-sm text-muted-foreground">{existingReview.comment}</p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowReviewDialog(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ReviewDialog
          orderItemId={orderItemId}
          productName={productName}
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          onReviewSubmitted={handleReviewSubmitted}
          existingReview={existingReview}
        />


      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowReviewDialog(true)}
        className="w-full"
      >
        <Star className="h-4 w-4 me-2" />
        {t("addReview")}
      </Button>

      <ReviewDialog
        orderItemId={orderItemId}
        productName={productName}
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </>
  );
}

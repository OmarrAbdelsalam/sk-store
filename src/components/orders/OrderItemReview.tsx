"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewDialog } from "./ReviewDialog";
import { getOrCreateSessionId } from "@/lib/session";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type OrderItemReviewProps = {
  orderItemId: number;
  productName: string;
  existingReview?: {
    id: number;
    rating: number;
    comment: string | null;
  } | null;
  onReviewChange?: () => void;
};

export function OrderItemReview({
  orderItemId,
  productName,
  existingReview,
  onReviewChange,
}: OrderItemReviewProps) {
  const t = useTranslations("Reviews");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!existingReview) return;

    setIsDeleting(true);
    try {
      const sessionId = getOrCreateSessionId();
      const response = await fetch(
        `https://scrubstore.runasp.net/api/Reviews/${existingReview.id}?sessionId=${sessionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      setShowDeleteDialog(false);
      if (onReviewChange) {
        onReviewChange();
      }
    } catch (err) {
      console.error("Error deleting review:", err);
    } finally {
      setIsDeleting(false);
    }
  };

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent dir={isAr ? "rtl" : "ltr"}>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? t("deleting") : t("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
        onReviewSubmitted={onReviewChange}
      />
    </>
  );
}

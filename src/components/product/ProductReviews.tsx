"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Star, User} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewSection } from "@/components/reviews";

type Review = {
  id: number | string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string | null;
  verified?: boolean;
  colorName?: string;
  sizeName?: string;
};

interface ProductReviewsProps {
  reviews: Review[];
  averageRating?: number;
  totalReviews?: number;
  productId?: number | string;
  orderId?: number | string;
  sessionId?: string;
  canAddReview?: boolean;
}

export default function ProductReviews({ 
  reviews = [], 
  averageRating = 0, 
  totalReviews = 0,
  productId,
  orderId,
  sessionId,
  canAddReview = false
}: ProductReviewsProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("ProductReviews");
  
  const [showAll, setShowAll] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // عرض أول 3 مراجعات فقط إذا لم يضغط المستخدم "عرض الكل"
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);
  
  // تصفية حسب التقييم إذا تم اختيار فلتر
  const filteredReviews = filterRating 
    ? displayedReviews.filter(review => review.rating === filterRating)
    : displayedReviews;

  // حساب توزيع النجوم
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "sm") => {
    const sizeClass = {
      sm: "w-4 h-4",
      md: "w-5 h-5", 
      lg: "w-6 h-6"
    }[size];

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (review: Review) => {
    // استخدم updatedAt إذا كان موجود، وإلا استخدم createdAt
    const dateString = review.updatedAt || review.createdAt;
    const date = new Date(dateString);
    return isAr 
      ? date.toLocaleDateString('ar-EG', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
  };

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          {t("title")} ({totalReviews || reviews.length})
        </h2>
        {canAddReview && productId && sessionId && (
          <div className="hidden lg:block">
            <Button variant="outline" size="sm">
              {t("writeReview")}
            </Button>
          </div>
        )}
      </div>

      {/* User Review Section - Show at top if user can add review */}
      {canAddReview && productId && sessionId && (
        <div className="mb-8">
          <ReviewSection
            productId={productId}
            orderId={orderId}
            sessionId={sessionId}
            className="bg-blue-50 p-6 rounded-lg"
          />
        </div>
      )}

      {/* ملخص التقييمات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* التقييم العام */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </div>
            {renderStars(Math.round(averageRating), "lg")}
            <p className="text-sm text-gray-600 mt-2">
              {t("basedOn", { count: totalReviews || reviews.length })}
            </p>
          </CardContent>
        </Card>

        {/* توزيع النجوم */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">{t("ratingBreakdown")}</h3>
            <div className="space-y-3">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 min-w-[60px]">
                    <span className="text-sm">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 min-w-[40px]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فلاتر التقييم */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filterRating === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterRating(null)}
        >
          {t("allReviews")}
        </Button>
        {[5, 4, 3, 2, 1].map(rating => (
          <Button
            key={rating}
            variant={filterRating === rating ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterRating(rating)}
            className="gap-1"
          >
            {rating} <Star className="w-3 h-3" />
          </Button>
        ))}
      </div>

      {/* قائمة المراجعات */}
      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{review.name}</h4>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          {t("verified")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">
                        {formatDate(review)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 leading-relaxed mb-4">
                {review.comment}
              </p>
              
              {/* معلومات المنتج المراجع */}
              {(review.colorName || review.sizeName) && (
                <div className="flex gap-2 mb-4">
                  {review.colorName && (
                    <Badge variant="outline">
                      {t("color")}: {review.colorName}
                    </Badge>
                  )}
                  {review.sizeName && (
                    <Badge variant="outline">
                      {t("size")}: {review.sizeName}
                    </Badge>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        ))}
      </div>

      {/* زر عرض المزيد */}
      {reviews.length > 3 && !showAll && (
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(true)}
            className="px-8"
          >
            {t("showMore", { count: reviews.length - 3 })}
          </Button>
        </div>
      )}
    </div>
  );
}
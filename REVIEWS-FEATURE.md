# Reviews Feature Implementation

This document describes the implementation of the reviews feature for the House Scrub Store application.

## Overview

The reviews feature allows customers to rate and review products they have purchased. The system follows specific business rules to ensure one review per product per order.

## Business Rules

1. **One Review Per Product Per Order**: Each product in an order can have only one review
2. **Multiple Orders**: If the same product is ordered multiple times (even different colors), it still gets only one review
3. **Different Products**: Different products in the same order get separate reviews
4. **Edit/Delete**: Users can edit or delete their own reviews
5. **Session-Based**: Reviews are tied to session IDs for user identification

## API Endpoints

### GET /api/Reviews/{reviewId}
Retrieves a specific review by ID.

**Parameters:**
- `reviewId` (path, required): The review ID
- `sessionId` (query, optional): Session ID for user verification

**Response:** Review object or 404 if not found

### PUT /api/Reviews
Creates or updates a review.

**Request Body:**
```json
{
  "reviewId": 0,
  "sessionId": "string",
  "rating": 5,
  "comment": "string"
}
```

**Response:** Updated review object

## Components

### ReviewSection
Main component that handles the review functionality for a product.

**Props:**
- `productId`: Product ID
- `orderId`: Order ID (optional)
- `sessionId`: User session ID
- `className`: Additional CSS classes

**Usage:**
```tsx
<ReviewSection
  productId={123}
  orderId={456}
  sessionId={sessionId}
/>
```

### ReviewForm
Form component for creating/editing reviews.

**Props:**
- `productId`: Product ID
- `orderId`: Order ID (optional)
- `sessionId`: User session ID
- `existingReview`: Existing review data for editing
- `onReviewSubmitted`: Callback when review is submitted
- `onCancel`: Callback when form is cancelled

### ReviewDisplay
Component for displaying a review.

**Props:**
- `review`: Review data
- `canEdit`: Whether user can edit the review
- `canDelete`: Whether user can delete the review
- `onEdit`: Edit callback
- `onDelete`: Delete callback

## Integration

### Product Detail Page
The review functionality is integrated into the product detail page through the `ProductReviews` component:

```tsx
<ProductReviews 
  reviews={product?.reviews || []}
  averageRating={product?.averageRating || 0}
  totalReviews={product?.reviews?.length || 0}
  productId={product?.id}
  sessionId={getOrCreateSessionId()}
  canAddReview={true}
/>
```

### Order Management
Reviews can also be managed from the order history page, where users can review individual products from their orders.

## Hooks

### useReviews
Custom hook for managing review state and API calls.

**Returns:**
- `review`: Current review data
- `isLoading`: Loading state
- `error`: Error message
- `submitReview`: Function to submit a review
- `deleteReview`: Function to delete a review
- `refreshReview`: Function to refresh review data

## Types

### Review
```typescript
interface Review {
  reviewId: number;
  sessionId: string;
  rating: number;
  comment: string;
  productId?: number;
  orderId?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

### ReviewFormData
```typescript
interface ReviewFormData {
  rating: number;
  comment: string;
}
```

## Internationalization

The feature supports both Arabic and English languages through the `next-intl` library. Translation keys are defined in:
- `messages/ar.json`
- `messages/en.json`

Key translation namespaces:
- `Reviews.*` - Review form and actions
- `ProductReviews.*` - Product review display

## Demo

A demo page is available at `/reviews-demo` to test the review functionality.

## Files Created/Modified

### New Files:
- `src/types/review.ts` - Review type definitions
- `src/lib/reviewApi.ts` - API functions for reviews
- `src/components/reviews/ReviewForm.tsx` - Review form component
- `src/components/reviews/ReviewDisplay.tsx` - Review display component
- `src/components/reviews/ReviewSection.tsx` - Main review section component
- `src/components/reviews/index.ts` - Export file
- `src/hooks/useReviews.ts` - Review management hook
- `src/app/[locale]/reviews-demo/page.tsx` - Demo page

### Modified Files:
- `src/components/product/ProductReviews.tsx` - Enhanced with review functionality
- `src/components/product/ProductDetailContent.tsx` - Added review integration
- `messages/ar.json` - Added Arabic translations
- `messages/en.json` - Added English translations

## Usage Examples

### Basic Review Section
```tsx
import { ReviewSection } from '@/components/reviews';
import { getOrCreateSessionId } from '@/lib/session';

function ProductPage({ productId }) {
  const sessionId = getOrCreateSessionId();
  
  return (
    <ReviewSection
      productId={productId}
      sessionId={sessionId}
    />
  );
}
```

### With Order Context
```tsx
<ReviewSection
  productId={product.id}
  orderId={order.id}
  sessionId={user.sessionId}
  className="bg-gray-50 p-4 rounded-lg"
/>
```

## Notes

- The implementation assumes the API endpoints follow the specification provided
- Session management is handled through the existing `getOrCreateSessionId` function
- The feature is fully responsive and works on both desktop and mobile
- Error handling is implemented for network failures and validation errors
- The UI follows the existing design system and component patterns
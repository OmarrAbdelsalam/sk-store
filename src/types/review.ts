export interface Review {
  reviewId: number | string;
  sessionId: string;
  rating: number;
  comment: string;
  productId?: number | string;
  orderId?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}

export interface ReviewApiRequest {
  reviewId: number | string;
  sessionId: string;
  rating: number;
  comment: string;
}

export interface ReviewApiResponse {
  success: boolean;
  review?: Review;
  message?: string;
}
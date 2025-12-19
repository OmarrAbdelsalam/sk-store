export interface Review {
  reviewId: number;
  sessionId: string;
  rating: number;
  comment: string;
  productId?: number;
  orderId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}

export interface ReviewApiRequest {
  reviewId: number;
  sessionId: string;
  rating: number;
  comment: string;
}

export interface ReviewApiResponse {
  success: boolean;
  review?: Review;
  message?: string;
}
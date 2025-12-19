"use client";

import { useState } from 'react';
import { ReviewSection } from '@/components/reviews';
import { getOrCreateSessionId } from '@/lib/session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReviewsDemoPage() {
  const [sessionId] = useState(() => getOrCreateSessionId());

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Reviews Feature Demo</h1>
          <p className="text-gray-600">
            This page demonstrates the new review functionality for products.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Review System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Add new reviews with 1-5 star ratings</li>
                  <li>Edit existing reviews</li>
                  <li>Delete reviews</li>
                  <li>One review per product per order</li>
                  <li>Session-based review management</li>
                  <li>Bilingual support (Arabic/English)</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Business Rules:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Each product in an order can have only one review</li>
                  <li>Same product ordered multiple times = one review</li>
                  <li>Different products in same order = separate reviews</li>
                  <li>Users can edit/delete their own reviews</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo Review Section</CardTitle>
            <p className="text-sm text-gray-600">
              Session ID: {sessionId}
            </p>
          </CardHeader>
          <CardContent>
            <ReviewSection
              productId={123}
              orderId={456}
              sessionId={sessionId}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">GET /api/Reviews/{reviewId}</h4>
                <p className="text-sm text-gray-600">
                  Retrieves a specific review by ID, with optional sessionId parameter
                </p>
              </div>
              <div>
                <h4 className="font-semibold">PUT /api/Reviews</h4>
                <p className="text-sm text-gray-600">
                  Creates or updates a review with the following payload:
                </p>
                <pre className="bg-gray-100 p-3 rounded text-xs mt-2">
{`{
  "reviewId": 0,
  "sessionId": "string",
  "rating": 5,
  "comment": "string"
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
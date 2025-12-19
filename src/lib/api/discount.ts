const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://scrubstore.runasp.net";

export interface DiscountResponse {
  succeeded: boolean;
  message: string;
  data?: {
    originalTotal: number;
    discountPercentage: number;
    discountValue: number;
    finalTotal: number;
  };
}

export async function applyDiscount(sessionId: string, discountCode: string): Promise<DiscountResponse> {
  try {
    const url = new URL(`${API_BASE}/api/Cart/Discount`);
    url.searchParams.append('sessionid', sessionId);
    url.searchParams.append('discountcode', discountCode);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        succeeded: false,
        message: data.message || 'Failed to apply discount code',
      };
    }

    return data;
  } catch (error) {
    console.error('Error applying discount:', error);
    return {
      succeeded: false,
      message: 'Network error occurred while applying discount code',
    };
  }
}

export async function deleteDiscount(sessionId: string): Promise<{ succeeded: boolean; message: string }> {
  try {
    const url = new URL(`${API_BASE}/api/Cart/Discount`);
    url.searchParams.append('sessionid', sessionId);

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        succeeded: false,
        message: data.message || 'Failed to remove discount code',
      };
    }

    return {
      succeeded: true,
      message: 'Discount code removed successfully',
    };
  } catch (error) {
    console.error('Error removing discount:', error);
    return {
      succeeded: false,
      message: 'Network error occurred while removing discount code',
    };
  }
}
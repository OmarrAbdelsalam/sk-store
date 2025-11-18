import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote } from "lucide-react";
import { memo } from "react";

interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image: string;
}
interface CheckoutOrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
  shippingPrice: number;
}

const CheckoutOrderSummary = memo(({ items, totalPrice, shippingPrice }: CheckoutOrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-luxury-cream rounded-lg overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
              </div>
            </div>
            <p className="font-medium">{item.price}</p>
          </div>
        ))}

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Total</span>
            <span>{totalPrice.toFixed(2)} EGP</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shippingPrice} EGP</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Grand Total</span>
            <span>{(totalPrice + shippingPrice).toFixed(2)} EGP</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Banknote className="h-4 w-4" />
              <span>Cash on Delivery</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CheckoutOrderSummary.displayName = "CheckoutOrderSummary";
export default CheckoutOrderSummary;

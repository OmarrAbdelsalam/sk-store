import ProductHeader from "@/components/product/ProductHeader";

interface ProductDetailErrorProps {
  dir: "rtl" | "ltr";
  message: string;
}

export default function ProductDetailError({ dir, message }: ProductDetailErrorProps) {
  return (
    <div className="min-h-screen" dir={dir}>
      <div className="container mx-auto px-4 py-6">
        <ProductHeader />
        <p className="text-destructive">{message}</p>
      </div>
    </div>
  );
}

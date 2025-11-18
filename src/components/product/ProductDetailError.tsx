import ProductHeader from "@/components/product/ProductHeader";

interface ProductDetailErrorProps {
  dir: "rtl" | "ltr";
  message: string;
  onBack: () => void;
}

export default function ProductDetailError({ dir, message, onBack }: ProductDetailErrorProps) {
  return (
    <div className="min-h-screen" dir={dir}>
      <div className="container mx-auto px-4 py-6">
        <ProductHeader onBack={onBack} />
        <p className="text-destructive">{message}</p>
      </div>
    </div>
  );
}

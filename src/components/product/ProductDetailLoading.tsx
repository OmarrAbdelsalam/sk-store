import ProductHeader from "@/components/product/ProductHeader";

interface ProductDetailLoadingProps {
  dir: "rtl" | "ltr";
  onBack: () => void;
}

export default function ProductDetailLoading({ dir, onBack }: ProductDetailLoadingProps) {
  return (
    <div className="min-h-screen" dir={dir}>
      <div className="container mx-auto px-4 py-6">
        <ProductHeader onBack={onBack} />
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-muted rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-muted rounded" />
            <div className="space-y-4">
              <div className="h-6 w-1/2 bg-muted rounded" />
              <div className="h-6 w-1/3 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { CartSkeleton } from "@/components/skeletons";

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-gutter py-8 sm:py-section lg:px-gutter-lg">
        <CartSkeleton />
      </div>
    </div>
  );
}

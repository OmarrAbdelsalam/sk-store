import { getTranslations } from "next-intl/server";
import { fetchProducts, filterProducts, type ProductApi } from "@/api/products";
import NewArrivalsCarousel from "@/components/NewArrivalsCarousel";
import { withRetry, formatError } from "@/lib/retry";

interface NewArrivalsProps {
  products?: ProductApi[];
}

const NewArrivals = async ({ products: initialProducts }: NewArrivalsProps = {}) => {
  const t = await getTranslations("NewArrivals");

  // Use provided products or fetch server-side
  let products: ProductApi[] = initialProducts?.filter(p => p.badge === 'new_arrival').slice(0, 4) || [];
  if (products.length === 0 && initialProducts?.length) {
    products = initialProducts.slice(0, 4);
  }

  if (products.length === 0) {
    try {
      const result = await withRetry(() => filterProducts({ badge: 'new_arrival', pageSize: 4 }), { label: "NewArrivals.fetchProducts" });
      products = result.items;
      
      // Fallback if no products have the badge
      if (products.length === 0) {
        const fallbackResult = await withRetry(() => fetchProducts(1, 4), { label: "NewArrivals.fetchProductsFallback" });
        products = fallbackResult.items;
      }
    } catch (error: any) {
      console.error("Failed to fetch new arrivals:", formatError(error));
    }
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="container mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-sans font-bold text-3xl md:text-4xl text-gray-900 mb-2">
            {t("title")}
          </h2>
          <div className="w-24 h-[2px] bg-[#C2A878] rounded-full mx-auto mt-3"></div>
        </div>

        {/* Client-side carousel with server-fetched data */}
        <NewArrivalsCarousel products={products} viewAllText={t("viewAll")} />
      </div>
    </section>
  );
};

export default NewArrivals;





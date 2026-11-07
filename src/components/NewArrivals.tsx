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
    // Product row — no visible heading, flush with neighbours (reference).
    <section className="bg-background" aria-labelledby="new-arrivals-title">
      <h2 id="new-arrivals-title" className="ds-gutter ds-display-md mb-8 text-center text-ink lg:mb-10">{t("title")}</h2>

      {/* Client-side carousel with server-fetched data (full-bleed) */}
      <NewArrivalsCarousel products={products} viewAllText={t("viewAll")} />
    </section>
  );
};

export default NewArrivals;





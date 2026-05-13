import { getTranslations } from "next-intl/server";
import type { ProductApi } from "@/api/products";
import ProductCard from "@/components/product/ProductCard";

interface ServerProductGridProps {
  products: ProductApi[];
  locale: string;
}

function mapProductForCard(p: ProductApi, locale: string) {
  const mainImage =
    p.photos?.find((ph) => ph.isMain)?.imageUrl ||
    p.photos?.[0]?.imageUrl ||
    "/placeholder-product.jpg";

  return {
    id: p.id,
    name: locale === "ar" ? p.nameAr : p.nameEn,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    price: `${p.price} ${locale === "ar" ? "جنيه" : "EGP"}`,
    priceNum: p.price,
    image: mainImage,
    description:
      locale === "ar"
        ? p.descriptionAr || p.descriptionEn || ""
        : p.descriptionEn || p.descriptionAr || "",
    gender: "unisex",
    availableColors:
      p.colors?.map((c) => ({
        name:
          locale === "ar"
            ? c.colorNameAr || c.colorNameEn || ""
            : c.colorNameEn || c.colorNameAr || "",
        hex: c.hexa || "#000000",
      })) || [],
    categoryIds: p.categories?.map((c) => c.id) || [],
    raw: p,
  };
}

export default async function ServerProductGrid({
  products,
  locale,
}: ServerProductGridProps) {
  const t = await getTranslations("ProductGrid");

  if (!products || products.length === 0) return null;

  const mappedProducts = products.map((p) => mapProductForCard(p, locale));

  return (
    <section id="products" className="pt-2 pb-4 bg-background">
      <div className="container mx-auto px-4">
        {/* Breadcrumb - Desktop/Tablet only */}
        <nav className="hidden md:flex items-center gap-2 text-sm mb-6">
          <span className="text-muted-foreground">
            {locale === "ar" ? "الرئيسية" : "Home"}
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">
            {locale === "ar" ? "كل المنتجات" : "All Products"}
          </span>
        </nav>

        {/* First 8 products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-6 items-stretch">
          {mappedProducts.map((product, index) => (
            <ProductCard
              key={String(product.id)}
              product={product as any}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

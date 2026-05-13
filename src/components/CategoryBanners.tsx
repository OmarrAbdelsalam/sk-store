import { getTranslations } from "next-intl/server";
import { getCategories, type CategoryOption } from "@/api/categories";
import ClothingShowcaseClient from "@/components/CategoryBannersClient";

export const BagShowcase = () => {
  return null;
};

export const ClothingShowcase = async () => {
  const t = await getTranslations("CategoryBanners");

  let categories: CategoryOption[] = [];
  try {
    categories = await getCategories();
  } catch (error) {
    categories = [];
  }

  if (!categories || categories.length === 0) return null;

  return (
    <ClothingShowcaseClient
      categories={categories}
      sectionTitle={t("title")}
    />
  );
};

import { getTranslations } from "next-intl/server";
import { customerLoveService, type CustomerLoveItem } from "@/services/customerLove";
import ReviewsGalleryClient from "@/components/ReviewsGalleryClient";

const ReviewsGallery = async () => {
  const t = await getTranslations("ReviewsGallery");

  let items: CustomerLoveItem[] = [];
  try {
    items = await customerLoveService.getActiveItems();
  } catch (error) {
    items = [];
  }

  if (!items || items.length === 0) return null;

  return (
    <ReviewsGalleryClient
      items={items}
      title={t("title")}
      subtitle={t("subtitle")}
      shareYours={t("shareYours")}
      tagUs={t("tagUs")}
    />
  );
};

export default ReviewsGallery;

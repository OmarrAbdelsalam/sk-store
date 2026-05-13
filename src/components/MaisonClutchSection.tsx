import { supabase } from "@/lib/supabaseClient";
import MaisonClutchClient from "@/components/MaisonClutchClient";

interface SectionData {
  id: string;
  title_en: string;
  title_ar: string;
  subtitle_en: string;
  subtitle_ar: string;
  description_en: string;
  description_ar: string;
  button_text_en: string;
  button_text_ar: string;
  product_id: string | null;
  link_url: string | null;
  video_url: string | null;
}

async function getSectionData(): Promise<SectionData | null> {
  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("section_key", "maison_clutch")
      .eq("is_active", 1)
      .single();

    if (error || !data) return null;
    return data as SectionData;
  } catch {
    return null;
  }
}

const MaisonClutchSection = async () => {
  const section = await getSectionData();

  if (!section) return null;

  // Determine the link: product page or custom URL
  const href = section.product_id
    ? `/product/${section.product_id}`
    : section.link_url || "/products";

  return (
    <MaisonClutchClient
      titleEn={section.title_en}
      titleAr={section.title_ar}
      subtitleEn={section.subtitle_en}
      subtitleAr={section.subtitle_ar}
      descriptionEn={section.description_en}
      descriptionAr={section.description_ar}
      buttonTextEn={section.button_text_en}
      buttonTextAr={section.button_text_ar}
      href={href}
      videoUrl={section.video_url || "/clutch.mp4"}
    />
  );
};

export default MaisonClutchSection;

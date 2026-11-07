"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { CONTACT_INFO } from "@/lib/constants";
import { siteUrl } from "@/lib/site";
import { openCartDrawer } from "@/lib/cart-drawer";

const Footer = () => {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === "ar";
  const { categories } = useCategories();
  // Categories come from a browser cache, so they're drawn after mount to
  // keep the server and client HTML identical.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const categoryHref = (name: string) => `/products?category=${encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"))}`;
  // Same hand-off as the menu drawer: the grid resolves the slug to its id.
  const rememberCategory = (id: string, name: string) => {
    try {
      sessionStorage.setItem(`category_${name.toLowerCase().replace(/\s+/g, "-")}`, id);
    } catch {}
  };

  // Footer — DESIGN_SYSTEM.md › Page anatomy (Prestige): white surface;
  // a short intro + primary button, then link columns with 12px uppercase
  // tracked headings and 14px ink/65 links; © line at the bottom.
  const link = "block text-fine text-ink/65 text-start transition-colors duration-fast hover:text-ink";
  const heading = "ds-label mb-5 text-ink";

  return (
    <footer className="relative z-20 bg-white text-ink">
      <div className="ds-page py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* About + WhatsApp (Prestige's newsletter column) */}
          <div>
            <p className={heading}>{t("Footer.brand")}</p>
            <p className="ds-body mb-5 text-ink/65">{t("Footer.brandDesc")}</p>
            <Button asChild>
              <a href={CONTACT_INFO.whatsappLink} target="_blank" rel="noopener noreferrer">
                {t("Footer.whatsapp")}
              </a>
            </Button>
          </div>

          {/* Shop */}
          <div>
            <p className={heading}>{t("Footer.shop")}</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products" className={link}>
                  {isAr ? "كل المنتجات" : "All products"}
                </Link>
              </li>
              {mounted && categories.map((category) => {
                const name = isAr ? category.arabicName : category.englishName;
                if (!name) return null;
                return (
                  <li key={category.key}>
                    <Link href={categoryHref(category.englishName || name)} onClick={() => rememberCategory(category.key, category.englishName || name)} className={link}>
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Orders */}
          <div>
            <p className={heading}>{t("Footer.orders")}</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/my-orders" className={link}>
                  {t("Footer.myOrders")}
                </Link>
              </li>
              <li>
                <button type="button" onClick={openCartDrawer} className={link}>
                  {isAr ? "سلة التسوق" : "Cart"}
                </button>
              </li>
            </ul>
          </div>

          {/* Follow / contact */}
          <div>
            <p className={heading}>{isAr ? "تابعينا" : "Follow us"}</p>
            <ul className="space-y-2.5">
              <li>
                <a href={CONTACT_INFO.whatsappLink} target="_blank" rel="noopener noreferrer" className={link}>
                  {t("Footer.whatsapp")}
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/skbags/" target="_blank" rel="noopener noreferrer" className={link}>
                  {t("Footer.instagram")}
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/skbags/" target="_blank" rel="noopener noreferrer" className={link}>
                  {t("Footer.facebook")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="ds-caption">© {new Date().getFullYear()} SK Bags.</p>
          {/* Developer credit → WhatsApp with a prefilled enquiry + this site's link */}
          <a
            href={`https://wa.me/201098505924?text=${encodeURIComponent(
              `Hi Omar, I'm interested in a website like this one: ${siteUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ds-caption transition-colors duration-fast hover:text-ink"
          >
            {isAr ? "تطوير " : "Developed by "}
            <span className="text-ink underline underline-offset-2">{isAr ? "عمر عبدالسلام" : "Omar Abdelsalam"}</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

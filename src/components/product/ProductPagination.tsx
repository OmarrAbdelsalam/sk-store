"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTranslations, useLocale } from "next-intl";
import { useMemo } from "react";

type ProductPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  disabled?: boolean;
};

type PageToken = number | "ellipsis";

/** يبني مصفوفة الصفحات مع نقاط الحذف حسب الحالة */
function buildPages(current: number, total: number, siblingCount: number): PageToken[] {
  if (total <= 0) return [];
  const c = Math.min(Math.max(current, 1), total);
  const totalNumbers = siblingCount * 2 + 1; // مثل 5 (2 يسار + الحالي + 2 يمين)
  const totalBlocks = totalNumbers + 2;      // + أول/آخر

  if (total <= totalBlocks) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const start = Math.max(2, c - siblingCount);
  const end = Math.min(total - 1, c + siblingCount);

  const pages: PageToken[] = [1];
  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);

  return pages;
}

export default function ProductPagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 2,
  disabled = false,
}: ProductPaginationProps) {
  // ✅ ننده Hooks دائمًا بدون أي شرط
  const t = useTranslations("Pagination");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const safeCurrent = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));

  const pages = useMemo(
    () => buildPages(safeCurrent, totalPages, Math.max(0, siblingCount)),
    [safeCurrent, totalPages, siblingCount]
  );

  const canPrev = safeCurrent > 1 && !disabled;
  const canNext = safeCurrent < totalPages && !disabled;

  const goTo = (page: number) => {
    if (disabled) return;
    const clamped = Math.min(Math.max(page, 1), totalPages);
    if (clamped !== safeCurrent) onPageChange(clamped);
  };

  // ✅ ممكن نرجع null بعد hooks عادي
  if (totalPages <= 1) return null;

  return (
    <div className="mt-16" dir={dir} aria-label={t("paginationNavLabel")}>
      <Pagination>
        <PaginationContent>
          {/* السابق */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (canPrev) goTo(safeCurrent - 1);
              }}
              aria-disabled={!canPrev}
              className={!canPrev ? "pointer-events-none opacity-50" : ""}
            >
              {t("previous")}
            </PaginationPrevious>
          </PaginationItem>

          {/* الصفحات */}
          {pages.map((token, idx) =>
            token === "ellipsis" ? (
              <PaginationItem key={`e-${idx}`}>
                <PaginationEllipsis aria-label={t("more")} />
              </PaginationItem>
            ) : (
              <PaginationItem key={token}>
                <PaginationLink
                  href="#"
                  isActive={token === safeCurrent}
                  aria-current={token === safeCurrent ? "page" : undefined}
                  aria-label={t("pageOfTotal", { page: token, total: totalPages })}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(token);
                  }}
                >
                  {token}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          {/* التالي */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (canNext) goTo(safeCurrent + 1);
              }}
              aria-disabled={!canNext}
              className={!canNext ? "pointer-events-none opacity-50" : ""}
            >
              {t("next")}
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* وصف للقارئات الشاشة */}
      <p className="sr-only">
        {t("currentPageStatus", { page: safeCurrent, total: totalPages })}
      </p>
    </div>
  );
}

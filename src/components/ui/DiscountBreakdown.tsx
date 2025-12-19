"use client";

import { useLocale, useTranslations } from "next-intl";
import { Tag, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface DiscountBreakdownProps {
  discount: {
    amount: number;
    percentage: number;
    code: string;
    originalTotal: number;
    finalTotal: number;
  };
  showAnimation?: boolean;
}

export default function DiscountBreakdown({ 
  discount, 
  showAnimation = true 
}: DiscountBreakdownProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const t = useTranslations("PromoCode");

  const savings = discount.originalTotal - discount.finalTotal;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isAr ? 20 : -20 },
    visible: { opacity: 1, x: 0 }
  };

  const Container = showAnimation ? motion.div : 'div';
  const Item = showAnimation ? motion.div : 'div';

  return (
    <Container
      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-3"
      variants={showAnimation ? containerVariants : undefined}
      initial={showAnimation ? "hidden" : undefined}
      animate={showAnimation ? "visible" : undefined}
    >
      {/* رأس الخصم */}
      <Item
        className="flex items-center gap-2 text-green-800"
        variants={showAnimation ? itemVariants : undefined}
      >
        <Tag className="w-4 h-4" />
        <span className="font-medium text-sm">
          {t("codeApplied")}: {discount.code}
        </span>
        <div className="flex items-center gap-1 text-xs bg-green-100 px-2 py-1 rounded-full">
          <TrendingDown className="w-3 h-3" />
          {discount.percentage}% {isAr ? "خصم" : "OFF"}
        </div>
      </Item>

      {/* تفاصيل الحساب */}
      <div className="space-y-2 text-sm">
        <Item
          className="flex justify-between items-center"
          variants={showAnimation ? itemVariants : undefined}
        >
          <span className="text-gray-600">
            {isAr ? "المجموع الأصلي:" : "Original Total:"}
          </span>
          <span className="font-medium">
            {discount.originalTotal.toFixed(2)} {isAr ? "جنيه" : "EGP"}
          </span>
        </Item>

        <Item
          className="flex justify-between items-center text-green-600"
          variants={showAnimation ? itemVariants : undefined}
        >
          <span>
            {t("discount")} ({discount.percentage}%):
          </span>
          <span className="font-medium">
            -{discount.amount.toFixed(2)} {isAr ? "جنيه" : "EGP"}
          </span>
        </Item>

        <div className="border-t border-green-200 pt-2">
          <Item
            className="flex justify-between items-center font-semibold text-base"
            variants={showAnimation ? itemVariants : undefined}
          >
            <span className="text-gray-900">
              {isAr ? "المجموع بعد الخصم:" : "Total After Discount:"}
            </span>
            <span className="text-green-700">
              {discount.finalTotal.toFixed(2)} {isAr ? "جنيه" : "EGP"}
            </span>
          </Item>
        </div>

        {/* إجمالي التوفير */}
        <Item
          className="bg-green-100 rounded-md p-2 text-center"
          variants={showAnimation ? itemVariants : undefined}
        >
          <p className="text-green-800 font-medium text-sm">
            🎉 {isAr ? "وفرت" : "You saved"} {savings.toFixed(2)} {isAr ? "جنيه!" : "EGP!"}
          </p>
        </Item>
      </div>
    </Container>
  );
}
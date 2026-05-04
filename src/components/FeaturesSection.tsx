"use client";

import { useTranslations } from "next-intl";
import { Truck, CreditCard, RotateCcw, Headphones } from "lucide-react";

const FeaturesSection = () => {
  const t = useTranslations("Features");

  const features = [
    {
      icon: Truck,
      title: t("freeShippingTitle"),
      description: t("freeShippingDesc"),
    },
    {
      icon: CreditCard,
      title: t("paymentTitle"),
      description: t("paymentDesc"),
    },
    {
      icon: RotateCcw,
      title: t("returnsTitle"),
      description: t("returnsDesc"),
    },
    {
      icon: Headphones,
      title: t("supportTitle"),
      description: t("supportDesc"),
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-white rounded-full scale-110 group-hover:scale-125 transition-transform duration-300 shadow-sm" />
                <div className="relative w-16 h-16 flex items-center justify-center text-gray-900">
                  <feature.icon strokeWidth={1.5} className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="font-medium text-lg text-gray-900 mb-2 tracking-wide">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

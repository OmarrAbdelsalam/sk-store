"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MaisonClutchSection = () => {
  const t = useTranslations("MaisonClutch");
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false); // Start with sound enabled
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleShopClick = () => {
    // Navigate to the specific Maison Clutch product page
    router.push("/product/fdd32b4e-1cfa-488e-9c5f-f83190d0c473");
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            <h2 className="font-playfair text-3xl md:text-5xl lg:text-6xl text-gray-900 leading-tight">
              {t("title")}
            </h2>
            
            <div className="space-y-6 max-w-xl">
              <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light">
                {t("p1")}
              </p>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light">
                {t("p2")}
              </p>
            </div>

            <Button 
              onClick={handleShopClick}
              className="px-10 py-6 bg-black text-white hover:bg-gray-800 rounded-none tracking-[0.2em] uppercase text-sm"
              variant="default"
            >
              {t("shopButton")}
            </Button>
          </div>

          {/* Video Content */}
          <div className="order-1 lg:order-2 w-full h-[500px] lg:h-[700px] relative bg-gray-100 rounded-xl overflow-hidden">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              src="/clutch.mp4"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MaisonClutchSection;

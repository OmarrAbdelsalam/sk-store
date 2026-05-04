"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Megaphone, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Palette,
  Loader2,
  Type,
  AlertCircle,
  Plus,
  Trash2,
  GripVertical,
  Sparkles
} from "lucide-react";
import { PageHeader, Card } from "@/components/admin/common";
import { useEffect, useState } from "react";
import { bannerService, BannerSettings } from "@/services/banner";
import { marqueeService, MarqueeItem, MarqueeSettings } from "@/services/marquee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const TopBannerPage = () => {
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Form state - English only
  const [textEn, setTextEn] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#ffffff");

  // Marquee state
  const [marqueeItems, setMarqueeItems] = useState<MarqueeItem[]>([]);
  const [marqueeSettings, setMarqueeSettings] = useState<MarqueeSettings | null>(null);
  const [marqueeLoading, setMarqueeLoading] = useState(true);
  const [marqueeSaving, setMarqueeSaving] = useState(false);
  const [marqueeHasChanges, setMarqueeHasChanges] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [marqueeBgColor, setMarqueeBgColor] = useState("#000000");
  const [marqueeTextColor, setMarqueeTextColor] = useState("#ffffff");

  useEffect(() => {
    loadBanner();
    loadMarquee();
  }, []);

  // Track banner changes
  useEffect(() => {
    if (banner) {
      const changed = 
        textEn !== banner.text_en ||
        isActive !== banner.is_active ||
        backgroundColor !== banner.background_color ||
        textColor !== banner.text_color;
      setHasChanges(changed);
    }
  }, [textEn, isActive, backgroundColor, textColor, banner]);

  // Track marquee changes
  useEffect(() => {
    if (marqueeSettings) {
      const changed = 
        marqueeBgColor !== marqueeSettings.background_color ||
        marqueeTextColor !== marqueeSettings.text_color;
      setMarqueeHasChanges(changed);
    }
  }, [marqueeBgColor, marqueeTextColor, marqueeSettings]);

  const loadBanner = async () => {
    try {
      setIsLoading(true);
      const data = await bannerService.getActive();
      
      if (data) {
        setBanner(data);
        setTextEn(data.text_en);
        setIsActive(data.is_active);
        setBackgroundColor(data.background_color);
        setTextColor(data.text_color);
      } else {
        setTextEn("Free Shipping on Orders Over 500 EGP");
        setIsActive(true);
        setBackgroundColor("#000000");
        setTextColor("#ffffff");
      }
    } catch (error) {
      console.error("Error loading banner:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل إعدادات البانر",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMarquee = async () => {
    try {
      setMarqueeLoading(true);
      const [items, settings] = await Promise.all([
        marqueeService.getAllItems(),
        marqueeService.getSettings(),
      ]);
      
      setMarqueeItems(items || []);
      if (settings) {
        setMarqueeSettings(settings);
        setMarqueeBgColor(settings.background_color);
        setMarqueeTextColor(settings.text_color);
      }
    } catch (error) {
      console.error("Error loading marquee:", error);
    } finally {
      setMarqueeLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const bannerData = {
        text_ar: textEn,
        text_en: textEn,
        is_active: isActive,
        background_color: backgroundColor,
        text_color: textColor,
      };

      if (banner?.id) {
        const updated = await bannerService.update(banner.id, bannerData);
        setBanner(updated);
      } else {
        const created = await bannerService.create(bannerData);
        setBanner(created);
      }

      setHasChanges(false);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات البانر بنجاح",
      });
    } catch (error) {
      console.error("Error saving banner:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ إعدادات البانر",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (banner) {
      setTextEn(banner.text_en);
      setIsActive(banner.is_active);
      setBackgroundColor(banner.background_color);
      setTextColor(banner.text_color);
    }
    setHasChanges(false);
  };

  const toggleActive = async () => {
    const newActive = !isActive;
    setIsActive(newActive);
    
    if (banner?.id) {
      try {
        await bannerService.toggleActive(banner.id, newActive);
        setBanner({ ...banner, is_active: newActive });
        toast({
          title: newActive ? "تم التفعيل" : "تم الإيقاف",
          description: newActive ? "البانر مفعل الآن" : "البانر متوقف الآن",
        });
      } catch (error) {
        setIsActive(!newActive);
        toast({
          title: "خطأ",
          description: "فشل في تغيير حالة البانر",
          variant: "destructive",
        });
      }
    }
  };

  // Marquee handlers
  const handleAddMarqueeItem = async () => {
    if (!newItemText.trim()) return;
    
    try {
      const newItem = await marqueeService.createItem(newItemText.trim().toUpperCase());
      setMarqueeItems([...marqueeItems, newItem]);
      setNewItemText("");
      toast({
        title: "تمت الإضافة",
        description: "تمت إضافة العنصر بنجاح",
      });
    } catch (error) {
      console.error("Error adding marquee item:", error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة العنصر",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMarqueeItem = async (id: string) => {
    try {
      await marqueeService.deleteItem(id);
      setMarqueeItems(marqueeItems.filter(item => item.id !== id));
      toast({
        title: "تم الحذف",
        description: "تم حذف العنصر بنجاح",
      });
    } catch (error) {
      console.error("Error deleting marquee item:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف العنصر",
        variant: "destructive",
      });
    }
  };

  const handleSaveMarqueeSettings = async () => {
    try {
      setMarqueeSaving(true);
      await marqueeService.updateSettings({
        background_color: marqueeBgColor,
        text_color: marqueeTextColor,
      });
      setMarqueeSettings({
        ...marqueeSettings!,
        background_color: marqueeBgColor,
        text_color: marqueeTextColor,
      });
      setMarqueeHasChanges(false);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الشريط المتحرك",
      });
    } catch (error) {
      console.error("Error saving marquee settings:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setMarqueeSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Megaphone}
          title="البانر العلوي"
          subtitle="إدارة نص البانر العلوي في المتجر"
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Megaphone}
        title="البانر العلوي"
        subtitle="إدارة البانر والشريط المتحرك في المتجر"
        actions={
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                إلغاء
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              size="sm"
              className="bg-[hsl(var(--luxury-charcoal))] hover:bg-[hsl(var(--luxury-charcoal))]/90 flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              حفظ البانر
            </Button>
          </div>
        }
      />

      {/* ==================== SECTION 1: Top Banner ==================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">البانر الرئيسي</h2>
            <p className="text-sm text-gray-500">النص الثابت في أعلى الصفحة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Preview & Status */}
          <div className="space-y-4">
            {/* Live Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-gray-500" />
                    معاينة
                  </h3>
                </div>
                <div className="p-4">
                  <div 
                    className="rounded-lg overflow-hidden shadow-md"
                    style={{ 
                      backgroundColor: backgroundColor,
                      color: textColor 
                    }}
                  >
                    <div className="flex items-center justify-center py-3 px-4">
                      <p className="text-xs font-medium tracking-wider uppercase text-center">
                        {textEn || "Your banner text here"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Status Card */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive 
                      ? "bg-green-100 text-green-600" 
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {isActive ? "مفعل" : "متوقف"}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {isActive ? "يظهر للزوار" : "مخفي"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleActive}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                  dir="ltr"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </Card>
          </div>

          {/* Right Column: Settings */}
          <Card className="h-fit">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 text-sm">الإعدادات</h3>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Banner Text */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Type className="w-4 h-4" />
                  نص البانر
                </label>
                <Input
                  value={textEn}
                  onChange={(e) => setTextEn(e.target.value)}
                  placeholder="Example: Free Shipping on Orders Over 500 EGP"
                  className="text-left h-10 rounded-lg"
                  dir="ltr"
                />
              </div>

              {/* Colors Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">لون الخلفية</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 font-mono text-xs h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">لون النص</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <Input
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 font-mono text-xs h-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ==================== SECTION 2: Marquee Banner ==================== */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">الشريط المتحرك</h2>
              <p className="text-sm text-gray-500">الجمل المتحركة أسفل البانر الرئيسي</p>
            </div>
          </div>
          {marqueeHasChanges && (
            <Button
              onClick={handleSaveMarqueeSettings}
              disabled={marqueeSaving}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            >
              {marqueeSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              حفظ الألوان
            </Button>
          )}
        </div>

        {marqueeLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Preview */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-gray-500" />
                    معاينة الشريط
                  </h3>
                </div>
                <div className="p-4">
                  <div 
                    className="rounded-lg overflow-hidden shadow-md"
                    style={{ 
                      backgroundColor: marqueeBgColor,
                      color: marqueeTextColor 
                    }}
                  >
                    <div className="py-2 overflow-hidden">
                      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
                        {marqueeItems.map((item, idx) => (
                          <span key={idx} className="text-xs font-medium tracking-widest uppercase flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                            {item.text}
                          </span>
                        ))}
                        {marqueeItems.map((item, idx) => (
                          <span key={`dup-${idx}`} className="text-xs font-medium tracking-widest uppercase flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                            {item.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Colors */}
              <Card className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  ألوان الشريط
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">الخلفية</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={marqueeBgColor}
                        onChange={(e) => setMarqueeBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <Input
                        value={marqueeBgColor}
                        onChange={(e) => setMarqueeBgColor(e.target.value)}
                        className="flex-1 font-mono text-xs h-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">النص</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={marqueeTextColor}
                        onChange={(e) => setMarqueeTextColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <Input
                        value={marqueeTextColor}
                        onChange={(e) => setMarqueeTextColor(e.target.value)}
                        className="flex-1 font-mono text-xs h-10"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Items Management */}
            <Card>
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900 text-sm">العناصر ({marqueeItems.length})</h3>
              </div>
              
              <div className="p-4 space-y-3">
                {/* Add New Item */}
                <div className="flex gap-2">
                  <Input
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value.toUpperCase())}
                    placeholder="ENTER NEW TEXT..."
                    className="flex-1 text-left h-10 font-medium tracking-wide"
                    dir="ltr"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMarqueeItem()}
                  />
                  <Button
                    onClick={handleAddMarqueeItem}
                    disabled={!newItemText.trim()}
                    size="sm"
                    className="h-10 px-4 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <AnimatePresence>
                    {marqueeItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group"
                      >
                        <GripVertical className="w-4 h-4 text-gray-300" />
                        <span className="flex-1 text-sm font-medium text-gray-700 tracking-wide" dir="ltr">
                          {item.text}
                        </span>
                        <button
                          onClick={() => handleDeleteMarqueeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {marqueeItems.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">لا توجد عناصر</p>
                      <p className="text-xs">أضف عناصر جديدة لتظهر في الشريط</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* CSS for marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TopBannerPage;

"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Save, Star, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { customerLoveService, CustomerLoveItem } from "@/services/customerLove";
import { uploadFile } from "@/api/admin/upload";

// ─── Star Rating Picker ───────────────────────────────────────────────────────
const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="focus:outline-none"
      >
        <Star
          size={24}
          className={
            star <= value
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }
        />
      </button>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CustomerLovePage = () => {
  const [items, setItems] = useState<CustomerLoveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomerLoveItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const data = await customerLoveService.getAllItems();
      setItems(data);
    } catch {
      toast.error("فشل في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (item?: CustomerLoveItem) => {
    if (item) {
      setEditingItem(item);
      setCurrentImageUrl(item.image_url);
      setCustomerName(item.customer_name || "");
      setReviewText(item.review_text || "");
      setRating(item.rating ?? 5);
      setIsFeatured(item.is_featured);
    } else {
      setEditingItem(null);
      setCurrentImageUrl("");
      setCustomerName("");
      setReviewText("");
      setRating(5);
      setIsFeatured(false);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentImageUrl && !imageFile) {
      toast.error("يرجى رفع صورة");
      return;
    }
    if (!customerName.trim()) {
      toast.error("يرجى إدخال اسم العميل");
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl = currentImageUrl;

      if (imageFile) {
        const res = await uploadFile(imageFile, "customer-love");
        if (!res.success || !res.data) throw new Error(res.error || "فشل رفع الصورة");
        finalImageUrl = res.data.url;
      }

      const payload = {
        image_url: finalImageUrl,
        customer_name: customerName.trim(),
        review_text: reviewText.trim() || undefined,
        rating,
        is_featured: isFeatured,
      };

      if (editingItem) {
        await customerLoveService.updateItem(editingItem.id, payload);
        toast.success("تم تحديث التقييم بنجاح");
      } else {
        await customerLoveService.createItem(payload);
        toast.success("تم إضافة التقييم بنجاح");
      }

      closeModal();
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (item: CustomerLoveItem) => {
    try {
      await customerLoveService.updateItem(item.id, { is_active: !item.is_active });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
      );
      toast.success(item.is_active ? "تم الإخفاء" : "تم الإظهار");
    } catch {
      toast.error("فشل في تغيير الحالة");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await customerLoveService.deleteItem(deleteId);
      toast.success("تم الحذف");
      setItems((prev) => prev.filter((i) => i.id !== deleteId));
    } catch {
      toast.error("فشل في الحذف");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Star}
        title="Customer Love"
        subtitle="إدارة تقييمات وصور العملاء التي تظهر في الصفحة الرئيسية"
        actions={
          <Button
            onClick={() => openModal()}
            className="bg-[hsl(var(--luxury-charcoal))] text-white hover:bg-[hsl(var(--luxury-charcoal))]/90 gap-2 rounded-xl shadow-lg shadow-[hsl(var(--luxury-charcoal))]/20 transition-all hover:scale-[1.02]"
          >
            <Plus size={18} />
            إضافة تقييم
          </Button>
        }
      />

      {/* Grid */}
      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد تقييمات حالياً</h3>
          <p className="text-gray-500 text-sm">أضف تقييمات العملاء لتظهر في الصفحة الرئيسية</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm border transition-all hover:shadow-md ${
                !item.is_active ? "opacity-50" : ""
              }`}
            >
              {/* Image */}
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.customer_name || ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={32} />
                  </div>
                )}

                {/* Featured badge */}
                {item.is_featured && (
                  <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    مميز
                  </span>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openModal(item)}
                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => toggleActive(item)}
                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white"
                  >
                    {item.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-800 truncate">
                  {item.customer_name || "—"}
                </p>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={
                        s <= (item.rating ?? 5)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
                {item.review_text && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.review_text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[32px]"
          dir="rtl"
        >
          <div className="bg-[hsl(var(--luxury-cream))]/30 px-6 pt-5 pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl text-[hsl(var(--luxury-charcoal))] font-luxury font-bold">
              {editingItem ? "تعديل التقييم" : "إضافة تقييم جديد"}
            </DialogTitle>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 space-y-5">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[hsl(var(--luxury-charcoal))]">
                صورة العميل <span className="text-red-500">*</span>
              </Label>
              <input
                id="cl-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div
                onClick={() => document.getElementById("cl-image")?.click()}
                className="w-full h-44 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[hsl(var(--luxury-charcoal))] hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden relative group cursor-pointer"
              >
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    className="w-full h-full object-cover"
                    alt="preview"
                  />
                ) : currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    className="w-full h-full object-cover"
                    alt="current"
                  />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--luxury-cream))] flex items-center justify-center text-[hsl(var(--luxury-charcoal))] mb-1 group-hover:scale-110 transition-transform">
                      <ImageIcon size={20} />
                    </div>
                    <p className="text-sm font-medium text-gray-600">اضغط لرفع صورة</p>
                    <p className="text-xs text-gray-400">PNG, JPG حتى 5MB</p>
                  </>
                )}
                {(imageFile || currentImageUrl) && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium flex items-center gap-2">
                      <Pencil size={16} /> تغيير الصورة
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[hsl(var(--luxury-charcoal))]">
                اسم العميل <span className="text-red-500">*</span>
              </Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثال: Sarah Ahmed"
                className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[hsl(var(--luxury-charcoal))]"
              />
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[hsl(var(--luxury-charcoal))]">
                نص التقييم
              </Label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Amazing quality and beautiful design!"
                rows={3}
                className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[hsl(var(--luxury-charcoal))] resize-none"
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[hsl(var(--luxury-charcoal))]">
                التقييم
              </Label>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFeatured((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isFeatured ? "bg-yellow-400" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isFeatured ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <Label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setIsFeatured((v) => !v)}>
                تمييز هذا التقييم
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="flex-1 h-12 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl bg-[hsl(var(--luxury-charcoal))] text-white hover:bg-[hsl(var(--luxury-charcoal))]/90 shadow-lg shadow-[hsl(var(--luxury-charcoal))]/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 animate-spin" size={18} />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="ml-2" size={18} />
                    حفظ
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-[32px] border-none shadow-2xl" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-luxury font-bold text-[hsl(var(--luxury-charcoal))]">
              حذف التقييم
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600 h-11">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-50 text-red-600 hover:bg-red-100 rounded-xl h-11 border border-red-100 shadow-none"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerLovePage;

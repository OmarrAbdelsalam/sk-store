"use client";

import { useEffect, useState } from "react";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult, 
  DroppableProvided, 
  DraggableProvided, 
  DraggableStateSnapshot, 
  DroppableStateSnapshot 
} from "@hello-pangea/dnd";
import { Plus, Pencil, Trash2, GripVertical, Loader2, Image as ImageIcon, Save, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { PageHeader } from "@/components/admin/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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

import { categoryService, Category } from "@/services/categories";
import { uploadFile } from "@/api/admin/upload";

// StrictMode Droppable Fix for Next.js 13+ / React 18


const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [nameEn, setNameEn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Enabled for strict mode support
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error(error);
      toast.error("فشل في تحميل الفئات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setNameEn(category.name_en);
      setDescriptionEn(category.description_en || "");
      setCurrentImageUrl(category.image_url);
    } else {
      setEditingCategory(null);
      setNameEn("");
      setDescriptionEn("");
      setCurrentImageUrl(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn) {
      toast.error("يرجى إدخال اسم الفئة");
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl = currentImageUrl;

      // 1. Upload Image to Supabase if new file selected
      if (imageFile) {
        const uploadRes = await uploadFile(imageFile, 'categories');

        if (!uploadRes.success || !uploadRes.data) {
          throw new Error(uploadRes.error || "Image upload failed");
        }
        
        finalImageUrl = uploadRes.data.url;
      }

      // 2. Save to Supabase
      const inputData = {
        name_en: nameEn,
        description_en: descriptionEn,
        image_url: finalImageUrl || undefined,
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, inputData);
        toast.success("تم تحديث الفئة بنجاح");
      } else {
        await categoryService.create(inputData as any);
        toast.success("تم إنشاء الفئة بنجاح");
      }

      handleCloseModal();
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await categoryService.delete(deleteId);
      toast.success("تم حذف الفئة");
      setCategories(prev => prev.filter(c => c.id !== deleteId));
    } catch (error) {
      toast.error("فشل في الحذف");
    } finally {
      setDeleteId(null);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newCategories = Array.from(categories);
    const [reorderedItem] = newCategories.splice(sourceIndex, 1);
    newCategories.splice(destinationIndex, 0, reorderedItem);

    // Optimistic UI update
    setCategories(newCategories);

    // Prepare updates
    const updates = newCategories.map((cat, index) => ({
      id: cat.id,
      display_order: index + 1,
    }));

    try {
      await categoryService.reorder(updates);
    } catch (error) {
      console.error(error);
      toast.error("فشل في حفظ الترتيب");
      fetchCategories(); // Revert on error
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GripVertical}
        title="إدارة الفئات"
        subtitle="إضافة وتعديل وترتيب تصنيفات المنتجات"
        actions={
            <Button onClick={() => handleOpenModal()} className="bg-[hsl(var(--luxury-charcoal))] text-white hover:bg-[hsl(var(--luxury-charcoal))]/90 gap-2 rounded-xl shadow-lg shadow-[hsl(var(--luxury-charcoal))]/20 transition-all hover:scale-[1.02]">
            <Plus size={18} />
            فئة جديدة
          </Button>
        }
      />

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد فئات حالياً</h3>
            <p className="text-gray-500 text-sm">قم بإضافة فئات جديدة لتظهر في المتجر</p>
          </div>
        ) : (
          enabled && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="categories">
                {(provided: DroppableProvided) => (
                  <ul 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {categories.map((category, index) => (
                      <Draggable key={category.id} draggableId={category.id} index={index}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              bg-white rounded-2xl p-3 pl-4 flex items-center gap-4 transition-all duration-300 group
                              ${snapshot.isDragging 
                                ? 'shadow-2xl shadow-[hsl(var(--luxury-charcoal))]/20 ring-2 ring-[hsl(var(--luxury-charcoal))] scale-[1.02] z-50 rotate-1' 
                                : 'shadow-sm border border-transparent hover:border-[hsl(var(--luxury-cream))] hover:shadow-md'
                              }
                            `}
                          >
                            <div 
                              {...provided.dragHandleProps} 
                              className={`p-2 rounded-xl transition-colors cursor-grab active:cursor-grabbing
                                ${snapshot.isDragging ? 'text-[hsl(var(--luxury-charcoal))] bg-[hsl(var(--luxury-cream))]' : 'text-gray-300 group-hover:text-gray-500 group-hover:bg-gray-50'}
                              `}
                            >
                              <GripVertical size={20} />
                            </div>

                            <div className="w-16 h-16 rounded-xl bg-[hsl(var(--luxury-cream))]/30 overflow-hidden flex-shrink-0 relative border border-gray-100">
                              {category.image_url ? (
                                <img src={category.image_url} alt={category.name_en} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[hsl(var(--luxury-stone))]">
                                  <ImageIcon size={24} />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-[hsl(var(--luxury-charcoal))] text-lg font-luxury tracking-wide truncate">
                                {category.name_en}
                              </h3>
                              {/* Description removed as requested */}
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleOpenModal(category)}
                                className="w-9 h-9 rounded-xl text-gray-400 hover:text-[hsl(var(--luxury-charcoal))] hover:bg-[hsl(var(--luxury-cream))]"
                              >
                                <Pencil size={18} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(category.id)}
                                className="w-9 h-9 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash2 size={18} />
                              </Button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          )
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[32px]" dir="rtl">
          <div className="bg-[hsl(var(--luxury-cream))]/30 px-6 pt-5 pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl text-[hsl(var(--luxury-charcoal))] font-luxury font-bold">
              {editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
            </DialogTitle>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pt-2 pb-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-[hsl(var(--luxury-charcoal))]">اسم الفئة (English)</Label>
              <div className="relative">
                <Input 
                  id="name" 
                  value={nameEn} 
                  onChange={(e) => setNameEn(e.target.value)} 
                  placeholder="Ex: Travel Bags"
                  className="text-left h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[hsl(var(--luxury-charcoal))] transition-all pr-4 pl-4"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-semibold text-[hsl(var(--luxury-charcoal))]">صورة الفئة</Label>
              <div className="relative group cursor-pointer">
                <Input 
                  id="image" 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                <div 
                  onClick={() => document.getElementById('image')?.click()}
                  className="w-full h-40 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[hsl(var(--luxury-charcoal))] hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden relative group"
                >
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" />
                  ) : currentImageUrl ? (
                    <img src={currentImageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[hsl(var(--luxury-cream))] flex items-center justify-center text-[hsl(var(--luxury-charcoal))] mb-1 group-hover:scale-110 transition-transform">
                        <ImageIcon size={20} />
                      </div>
                      <p className="text-sm font-medium text-gray-600">اضغط لرفع صورة</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
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
            </div>

            <div className="flex gap-3 pt-2">
               <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseModal}
                className="flex-1 h-12 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
                     حفظ التغييرات
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-[32px] border-none shadow-2xl" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-luxury font-bold text-[hsl(var(--luxury-charcoal))]">حذف الفئة</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              هل أنت متأكد من رغبتك في حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء، وقد يؤثر على المنتجات المرتبطة بها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600 h-11">إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl h-11 border border-red-100 shadow-none"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoriesPage;
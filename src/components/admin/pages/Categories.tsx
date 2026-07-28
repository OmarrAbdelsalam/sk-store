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


import { useQuery, useQueryClient } from "@tanstack/react-query";

const CategoriesPage = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories-data'],
    queryFn: async () => {
      return await categoryService.getAll();
    },
    staleTime: 5 * 60 * 1000,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [nameEn, setNameEn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentMobileImageUrl, setCurrentMobileImageUrl] = useState<string | null>(null);

  // Enabled for strict mode support
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setNameEn(category.name_en);
      setDescriptionEn(category.description_en || "");
      setCurrentImageUrl(category.image_url);
      setCurrentMobileImageUrl(category.mobile_image_url);
    } else {
      setEditingCategory(null);
      setNameEn("");
      setDescriptionEn("");
      setCurrentImageUrl(null);
      setCurrentMobileImageUrl(null);
    }
    setImageFile(null);
    setMobileImageFile(null);
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

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMobileImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn) {
      toast.error("Please enter category name");
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl = currentImageUrl;
      let finalMobileImageUrl = currentMobileImageUrl;

      // 1. Upload Desktop Image to Supabase if new file selected
      if (imageFile) {
        const uploadRes = await uploadFile(imageFile, 'categories');

        if (!uploadRes.success || !uploadRes.data) {
          throw new Error(uploadRes.error || "Desktop image upload failed");
        }
        
        finalImageUrl = uploadRes.data.url;
      }

      // 2. Upload Mobile Image to Supabase if new file selected
      if (mobileImageFile) {
        const uploadRes = await uploadFile(mobileImageFile, 'categories/mobile');

        if (!uploadRes.success || !uploadRes.data) {
          throw new Error(uploadRes.error || "Mobile image upload failed");
        }
        
        finalMobileImageUrl = uploadRes.data.url;
      }

      // 3. Save to Supabase
      const inputData = {
        name_en: nameEn,
        description_en: descriptionEn,
        image_url: finalImageUrl || undefined,
        mobile_image_url: finalMobileImageUrl || undefined,
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, inputData);
        toast.success("Category updated successfully");
      } else {
        await categoryService.create(inputData as any);
        toast.success("Category created successfully");
      }

      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ['categories-data'] });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred while saving");
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
      toast.success("Category deleted");
      queryClient.setQueryData(['categories-data'], (old: Category[] | undefined) => old?.filter(c => c.id !== deleteId) || []);
    } catch (error) {
      toast.error("Failed to delete");
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
    queryClient.setQueryData(['categories-data'], newCategories);

    // Prepare updates
    const updates = newCategories.map((cat, index) => ({
      id: cat.id,
      display_order: index + 1,
    }));

    try {
      await categoryService.reorder(updates);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save order");
      queryClient.invalidateQueries({ queryKey: ['categories-data'] });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir="ltr">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="h-11 w-36 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>

        {/* Categories List Skeleton */}
        <div className="content-card p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl p-3 pl-4 flex items-center gap-4 border border-gray-100 shadow-sm animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-gray-200"></div>
                <div className="w-16 h-16 rounded-xl bg-gray-200 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gray-200"></div>
                  <div className="w-8 h-8 rounded-xl bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GripVertical}
        title="Manage Categories"
        subtitle="Add, edit and order product categories"
        actions={
            <Button onClick={() => handleOpenModal()} className="rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white px-5">
            <Plus size={18} className="mr-2" />
            New Category
          </Button>
        }
      />

      <div>
        {categories.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <ImageIcon className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No categories available</h3>
            <p className="text-gray-500 text-sm">Add new categories to appear in the store</p>
          </div>
        ) : (
          enabled && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="categories">
                {(provided: DroppableProvided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
                  >
                    {categories.map((category, index) => (
                      <Draggable key={category.id} draggableId={category.id} index={index}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`
                                relative rounded-2xl overflow-hidden group cursor-pointer
                                transition-all duration-300
                                ${snapshot.isDragging 
                                  ? 'shadow-2xl ring-2 ring-primary scale-[1.05] z-50 rotate-1' 
                                  : 'shadow-sm hover:shadow-lg border border-gray-100'
                                }
                              `}
                              onClick={() => handleOpenModal(category)}
                              style={{
                                ...provided.draggableProps.style,
                              }}
                            >
                              {/* Image */}
                              <div className="aspect-square bg-gray-50 relative">
                                {category.image_url ? (
                                  <img 
                                    src={category.image_url} 
                                    alt={category.name_en} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                                    <ImageIcon size={36} className="text-indigo-200" />
                                  </div>
                                )}

                                {/* Order Badge + Drag Handle */}
                                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                                  <div 
                                    {...provided.dragHandleProps}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center cursor-grab active:cursor-grabbing shadow-sm hover:bg-white transition-colors"
                                  >
                                    <GripVertical size={12} className="text-gray-500" />
                                  </div>
                                  <span className="h-7 px-2 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-[0.65rem] font-bold text-gray-500 shadow-sm">
                                    #{index + 1}
                                  </span>
                                </div>
                              </div>

                              {/* Name bar */}
                              <div className="bg-white px-3 py-2.5">
                                <h3 className="font-semibold text-gray-900 text-xs md:text-sm leading-snug truncate">
                                  {category.name_en}
                                </h3>
                              </div>
                            </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[32px]" dir="ltr">
          <div className="bg-gray-50 px-6 pt-5 pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl text-gray-900 font-bold">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pt-2 pb-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-900">Category Name</Label>
              <div className="relative">
                <Input 
                  id="name" 
                  value={nameEn} 
                  onChange={(e) => setNameEn(e.target.value)} 
                  placeholder="Ex: Travel Bags"
                  className="text-left h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary transition-all pr-4 pl-4"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-semibold text-gray-900">Desktop Image</Label>
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
                  className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden relative group"
                >
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" />
                  ) : currentImageUrl ? (
                    <img src={currentImageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1 group-hover:scale-110 transition-transform">
                        <ImageIcon size={18} />
                      </div>
                      <p className="text-xs font-medium text-gray-600">Click to upload desktop image</p>
                      <p className="text-[10px] text-gray-400">Recommended: landscape ratio</p>
                    </>
                  )}
                  
                  {(imageFile || currentImageUrl) && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium flex items-center gap-2 text-sm">
                        <Pencil size={14} /> Change
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile-image" className="text-sm font-semibold text-gray-900">Mobile Image</Label>
              <div className="relative group cursor-pointer">
                <Input 
                  id="mobile-image" 
                  type="file" 
                  accept="image/*"
                  onChange={handleMobileImageChange}
                  className="hidden"
                />
                
                <div 
                  onClick={() => document.getElementById('mobile-image')?.click()}
                  className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden relative group"
                >
                  {mobileImageFile ? (
                    <img src={URL.createObjectURL(mobileImageFile)} className="w-full h-full object-cover" />
                  ) : currentMobileImageUrl ? (
                    <img src={currentMobileImageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-1 group-hover:scale-110 transition-transform">
                        <ImageIcon size={18} />
                      </div>
                      <p className="text-xs font-medium text-gray-600">Click to upload mobile image</p>
                      <p className="text-[10px] text-gray-400">Recommended: square or portrait ratio</p>
                    </>
                  )}
                  
                  {(mobileImageFile || currentMobileImageUrl) && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium flex items-center gap-2 text-sm">
                        <Pencil size={14} /> Change
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 h-12 rounded-xl shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={18} />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

            {editingCategory && (
              <div className="border-t border-gray-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => { handleCloseModal(); handleDelete(editingCategory.id); }}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl py-3 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete this category
                </button>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-[32px] border-none shadow-2xl" dir="ltr">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Are you sure you want to delete this category? This cannot be undone and may affect linked products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600 h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl h-11 border border-red-100 shadow-none"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoriesPage;

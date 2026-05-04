"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Package, Loader2, Save, Image as ImageIcon, Search, X, Check } from "lucide-react";
import { toast } from "sonner";

import { DropboxImg } from "@/components/DropboxImage";
import { PageHeader } from "@/components/admin/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Checkbox } from "@/components/ui/checkbox";

import { productService, Product, ProductInput, BADGE_OPTIONS, validateProductImageSize, ProductBadge } from "@/services/products";
import { categoryService, Category } from "@/services/categories";
import { colorService, Color } from "@/services/colors";
import { uploadFile } from "@/api/admin/upload";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [material, setMaterial] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<{ file_path: string; color_id: string | null; is_main: number }[]>([]);
  const [selectedRelated, setSelectedRelated] = useState<string[]>([]);
  const [badge, setBadge] = useState<string>("");

  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData, colorsData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        colorService.getAll()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setColors(colorsData);
    } catch (error) {
      console.error(error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = async (product?: Product) => {
    // Reset Form
    setName("");
    setCategoryId("");
    setMaterial("");
    setDescription("");
    setPrice("");
    setComparePrice("");
    setSelectedColors([]);
    setProductImages([]);
    setSelectedRelated([]);
    setBadge("");

    if (product) {
      setEditingProduct(product);
      try {
        // Fetch full details (images, colors, related)
        const fullProduct = await productService.getById(product.id);
        
        setName(fullProduct.name_en);
        setCategoryId(fullProduct.category_id);
        setMaterial(fullProduct.material_en);
        setDescription(fullProduct.description_en);
        setPrice(fullProduct.base_price.toString());
        setComparePrice(fullProduct.compare_at_price ? fullProduct.compare_at_price.toString() : "");
        setBadge(fullProduct.badge || "");
        
        setSelectedColors(fullProduct.color_ids || []);
        
        // Map images to UI structure
        setProductImages(fullProduct.images?.map((img: any) => ({
          file_path: img.file_path,
          color_id: img.color_id,
          is_main: img.is_main
        })) || []);

        setSelectedRelated(fullProduct.related_ids || []);

      } catch (error) {
        toast.error("فشل في تحميل تفاصيل المنتج");
        return;
      }
    } else {
      setEditingProduct(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    try {
      setIsUploading(true);
      const files = Array.from(e.target.files);
      const newImages: { file_path: string; color_id: string | null; is_main: number }[] = [];

      for (const file of files) {
        // Validate file size (max 1MB)
        const sizeValidation = validateProductImageSize(file);
        if (!sizeValidation.valid) {
          toast.error(sizeValidation.error);
          continue;
        }

        const uploadRes = await uploadFile(file, 'products');

        if (!uploadRes.success || !uploadRes.data) {
          throw new Error(uploadRes.error || "Image upload failed");
        }
        
        // Store public URL
        newImages.push({
            file_path: uploadRes.data.url,
            color_id: null, // Default: no color linked
            is_main: productImages.length === 0 && newImages.length === 0 ? 1 : 0 // First image is main by default
        });
      }

      setProductImages(prev => [...prev, ...newImages]);

    } catch (error) {
      toast.error("فشل في رفع الصور");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetMainImage = (index: number) => {
    const updated = productImages.map((img, i) => ({
      ...img,
      is_main: i === index ? 1 : 0
    }));
    setProductImages(updated);
  };

  const handleRemoveImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageColorChange = (index: number, colorId: string) => {
    const updated = [...productImages];
    updated[index].color_id = colorId === "none" ? null : colorId;
    setProductImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !price || !description) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (productImages.length === 0) {
        toast.error("Please upload at least one image");
        return;
    }

    try {
      setIsSubmitting(true);
      const inputData: ProductInput = {
        name_en: name,
        description_en: description,
        category_id: categoryId,
        material_en: material,
        base_price: parseFloat(price),
        compare_at_price: comparePrice ? parseFloat(comparePrice) : undefined,
        badge: badge ? badge as ProductBadge : null,
        color_ids: selectedColors,
        images: productImages,
        related_product_ids: selectedRelated
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, inputData);
        toast.success("تم تحديث المنتج بنجاح");
      } else {
        await productService.create(inputData);
        toast.success("تم إضافة المنتج بنجاح");
      }

      handleCloseModal();
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await productService.delete(deleteId);
      toast.success("تم حذف المنتج");
      setProducts(prev => prev.filter(p => p.id !== deleteId));
    } catch (error) {
      toast.error("فشل في الحذف");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="إدارة المنتجات"
        subtitle="جميع منتجات المتجر"
        actions={
          <Button onClick={() => handleOpenModal()} className="bg-[hsl(var(--luxury-charcoal))] text-white hover:bg-[hsl(var(--luxury-charcoal))]/90 gap-2 rounded-xl shadow-lg shadow-[hsl(var(--luxury-charcoal))]/20 transition-all hover:scale-[1.02]">
            <Plus size={18} />
            منتج جديد
          </Button>
        }
      />

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-[hsl(var(--luxury-cream))]/30 border-b border-gray-100">
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--luxury-charcoal))]">المنتج</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--luxury-charcoal))]">الفئة</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--luxury-charcoal))]">السعر</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--luxury-charcoal))]">الألوان</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[hsl(var(--luxury-charcoal))] rounded-tl-[32px]">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                لا توجد منتجات حالياً
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-100 overflow-hidden flex-shrink-0">
                                            {product.main_image ? (
                                                <DropboxImg src={product.main_image} alt={product.name_en} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[hsl(var(--luxury-charcoal))] font-luxury">{product.name_en}</h3>
                                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{product.material_en}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                                        {product.category?.name_en || "-"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[hsl(var(--luxury-charcoal))]">{product.base_price} EGP</span>
                                        {product.compare_at_price && (
                                            <span className="text-xs text-gray-400 line-through">{product.compare_at_price} EGP</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex -space-x-2 space-x-reverse">
                                        {product.colors?.map((color, i) => (
                                            <div 
                                                key={i} 
                                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                                style={{ backgroundColor: color.hex_code }}
                                                title={color.name_en}
                                            />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleOpenModal(product)}
                                            className="w-9 h-9 rounded-xl text-gray-400 hover:text-[hsl(var(--luxury-charcoal))] hover:bg-[hsl(var(--luxury-cream))]"
                                        >
                                            <Pencil size={18} />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => setDeleteId(product.id)}
                                            className="w-9 h-9 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[32px] max-h-[90vh] flex flex-col" dir="rtl">
          <div className="bg-[hsl(var(--luxury-cream))]/30 px-8 pt-6 pb-5 border-b border-gray-100 flex-shrink-0">
            <DialogTitle className="text-2xl text-[hsl(var(--luxury-charcoal))] font-luxury font-bold">
              {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </DialogTitle>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-[hsl(var(--luxury-charcoal))] border-b border-gray-100 pb-2">Product Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name in English" className="rounded-xl" dir="ltr" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name_en}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="badge">Badge (Optional)</Label>
                        <Select value={badge} onValueChange={setBadge}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="No badge" />
                            </SelectTrigger>
                            <SelectContent>
                                {BADGE_OPTIONS.map(option => (
                                    <SelectItem key={option.value || 'none'} value={option.value || 'none'}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Price *</Label>
                        <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="comparePrice">Compare at Price (Optional)</Label>
                        <Input id="comparePrice" type="number" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="0.00" className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="material">Material (Optional)</Label>
                        <Input id="material" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g. Leather, Canvas..." className="rounded-xl" dir="ltr" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="rounded-xl" placeholder="Detailed product description..." dir="ltr" />
                    </div>
                </div>
            </div>

            {/* Section 2: Colors */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-[hsl(var(--luxury-charcoal))] border-b border-gray-100 pb-2">الألوان المتاحة</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {colors.map(color => {
                        const isSelected = selectedColors.includes(color.id);
                        return (
                            <div 
                                key={color.id}
                                onClick={() => {
                                    if (isSelected) setSelectedColors(prev => prev.filter(c => c !== color.id));
                                    else setSelectedColors(prev => [...prev, color.id]);
                                }}
                                className={`
                                    cursor-pointer rounded-xl p-3 border transition-all flex items-center gap-3
                                    ${isSelected ? 'border-[hsl(var(--luxury-charcoal))] bg-[hsl(var(--luxury-cream))]/20 ring-1 ring-[hsl(var(--luxury-charcoal))]' : 'border-gray-200 hover:border-gray-300'}
                                `}
                            >
                                <div className="w-8 h-8 rounded-full border border-gray-100 shadow-sm flex items-center justify-center" style={{ backgroundColor: color.hex_code }}>
                                    {isSelected && <Check size={14} className={color.hex_code.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'} />}
                                </div>
                                <span className="text-sm font-medium">{color.name_en}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section 3: Images */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-[hsl(var(--luxury-charcoal))] border-b border-gray-100 pb-2">صور المنتج</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Upload Box */}
                    <div className="md:col-span-1">
                        <div className="relative group cursor-pointer w-full h-40 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[hsl(var(--luxury-charcoal))] hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden">
                            <input 
                                type="file" 
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                disabled={isUploading}
                            />
                            {isUploading ? (
                                <Loader2 className="animate-spin text-[hsl(var(--luxury-charcoal))]" size={32} />
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--luxury-cream))] flex items-center justify-center text-[hsl(var(--luxury-charcoal))]">
                                        <ImageIcon size={20} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">اضغط لرفع الصور</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Image List */}
                    <div className="md:col-span-2 space-y-3 max-h-80 overflow-y-auto pr-2">
                        {productImages.map((img, idx) => (
                            <div key={idx} className="flex gap-4 p-3 border border-gray-100 rounded-xl bg-gray-50 items-start">
                                <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                    <DropboxImg src={img.file_path} alt="Product image" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Label className="text-xs text-gray-500 whitespace-nowrap">لون الصورة:</Label>
                                        <Select 
                                            value={img.color_id || "none"} 
                                            onValueChange={(val) => handleImageColorChange(idx, val)}
                                            dir="rtl"
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="اختر لون (اختياري)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">-- عام / بدون لون --</SelectItem>
                                                {colors.filter(c => selectedColors.includes(c.id)).map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="mainImage" 
                                                checked={img.is_main === 1} 
                                                onChange={() => handleSetMainImage(idx)}
                                                className="accent-[hsl(var(--luxury-charcoal))]"
                                            />
                                            صورة رئيسية
                                        </label>
                                        <button type="button" onClick={() => handleRemoveImage(idx)} className="text-xs text-red-500 hover:underline">حذف</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

             {/* Section 4: Related Products */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-[hsl(var(--luxury-charcoal))] border-b border-gray-100 pb-2">منتجات مرتبطة (اختياري)</h3>
                <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                     {products.filter(p => !editingProduct || p.id !== editingProduct.id).map(prod => (
                        <div key={prod.id} className="flex items-center space-x-2 space-x-reverse min-w-0">
                            <Checkbox 
                                id={`rel-${prod.id}`}
                                checked={selectedRelated.includes(prod.id)}
                                onCheckedChange={(checked) => {
                                    if (checked) setSelectedRelated(prev => [...prev, prod.id]);
                                    else setSelectedRelated(prev => prev.filter(id => id !== prod.id));
                                }}
                            />
                            <Label htmlFor={`rel-${prod.id}`} className="text-sm truncate cursor-pointer select-none">
                                {prod.name_en} - {prod.base_price} EGP
                            </Label>
                        </div>
                     ))}
                     {products.length <= (editingProduct ? 1 : 0) && <p className="text-sm text-gray-400 p-2 text-center col-span-full">لا توجد منتجات أخرى لربطها</p>}
                </div>
            </div>

          </form>
          
          <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex gap-4 flex-shrink-0">
             <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseModal}
                className="flex-1 h-12 rounded-xl border-gray-200 text-gray-600 hover:bg-white"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting} 
                className="flex-1 h-12 rounded-xl bg-[hsl(var(--luxury-charcoal))] text-white hover:bg-[hsl(var(--luxury-charcoal))]/90 shadow-lg"
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
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-[32px] border-none shadow-2xl" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-luxury font-bold text-[hsl(var(--luxury-charcoal))]">حذف المنتج</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              هل أنت متأكد من حذف هذا المنتج؟
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

export default ProductsPage;
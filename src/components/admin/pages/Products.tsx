"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Package, Loader2, Save, Image as ImageIcon, Search, X, Check, RefreshCw, FolderTree, Tag, DollarSign, PackageSearch, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { DropboxImg } from "@/components/DropboxImage";
import { PageHeader, Card } from "@/components/admin/common";
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

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraggableProductList } from "./DraggableProductList";

const ProductsPage = () => {
  const queryClient = useQueryClient();
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products-data'],
    queryFn: async () => {
      const [productsData, categoriesData, colorsData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        colorService.getAll()
      ]);
      return { productsData, categoriesData, colorsData };
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.productsData || [];
  const categories = data?.categoriesData || [];
  const colors = data?.colorsData || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Tabs & Sorting State
  const [activeTab, setActiveTab] = useState("all");

  const handleSaveBadgeOrder = async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, index) => ({ id, badge_order: index }));
    await productService.updateOrders(updates);
    refetch();
    toast.success("Order saved successfully");
  };

  const handleSaveCategoryOrder = async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, index) => ({ id, category_order: index }));
    await productService.updateOrders(updates);
    refetch();
    toast.success("Order saved successfully");
  };

  const handleSaveGlobalOrder = async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, index) => ({ id, global_order: index }));
    await productService.updateOrders(updates);
    refetch();
    toast.success("Order saved successfully");
  };

  const [sortCategoryId, setSortCategoryId] = useState("");

  const handleSetBadge = async (productId: string, newBadge: ProductBadge) => {
    await productService.update(productId, { badge: newBadge } as ProductInput);
    refetch();
    toast.success("Badge updated");
  };

  const handleSetCategory = async (productId: string, newCategoryId: string) => {
    await productService.update(productId, { category_id: newCategoryId } as ProductInput);
    refetch();
    toast.success("Category updated");
  };

  // Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [material, setMaterial] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<{ file_path: string; color_id: string | null; chain_option_value_id: string | null; is_main: number }[]>([]);
  const [selectedRelated, setSelectedRelated] = useState<string[]>([]);
  const [badge, setBadge] = useState<string>("");
  const [mainImageSecond, setMainImageSecond] = useState(false);
  const [chainOptions, setChainOptions] = useState<{ id: string; value_en: string; value_ar: string }[]>([]);

  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [colorSearch, setColorSearch] = useState('');

  // Add Color State
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [newColorEn, setNewColorEn] = useState('');
  const [newColorAr, setNewColorAr] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [isSavingColor, setIsSavingColor] = useState(false);

  const STEPS = [
    { label: 'Info', key: 'info' },
    { label: 'Colors', key: 'colors' },
    { label: 'Images', key: 'images' },
    { label: 'Related', key: 'related' },
  ];

  const filteredProducts = useMemo(() => {
    let result = products;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name_en.toLowerCase().includes(q) || (p.material_en && p.material_en.toLowerCase().includes(q)));
    }
    if (categoryFilter !== "all") {
      result = result.filter(p => p.category_id === categoryFilter);
    }
    return result;
  }, [products, searchQuery, categoryFilter]);

  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

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
    setMainImageSecond(false);
    setFormStep(0);
    setColorSearch('');
    setIsAddingColor(false);

    // Open modal immediately
    if (product) {
      setEditingProduct(product);
      setIsModalOpen(true);
      setIsLoadingProduct(true);
      try {
        const fullProduct = await productService.getById(product.id);
        
        setName(fullProduct.name_en || "");
        setCategoryId(fullProduct.category_id || "");
        setMaterial(fullProduct.material_en || "");
        setDescription(fullProduct.description_en || "");
        setPrice(fullProduct.base_price ? fullProduct.base_price.toString() : "");
        setComparePrice(fullProduct.compare_at_price ? fullProduct.compare_at_price.toString() : "");
        setBadge(fullProduct.badge || "");
        setMainImageSecond(
          fullProduct.main_image_second === 1 || 
          fullProduct.main_image_second === true || 
          fullProduct.main_image_second === "1"
        );
        
        setSelectedColors(fullProduct.color_ids || []);
        
        setProductImages(fullProduct.images?.map((img: any) => ({
          file_path: img.file_path,
          color_id: img.color_id,
          chain_option_value_id: img.chain_option_value_id || null,
          is_main: img.is_main
        })) || []);

        setSelectedRelated(fullProduct.related_ids || []);
        setChainOptions(fullProduct.chain_options || []);
      } catch (error) {
        toast.error("Failed to load product details");
        setIsModalOpen(false);
      } finally {
        setIsLoadingProduct(false);
      }
    } else {
      setEditingProduct(null);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormStep(0);
    setColorSearch('');
    setIsAddingColor(false);
  };

  const handleAddColor = async () => {
    if (!newColorEn || !newColorAr) {
      toast.error("Please fill in both English and Arabic names");
      return;
    }
    setIsSavingColor(true);
    try {
      const color = await colorService.create({
        name_en: newColorEn,
        name_ar: newColorAr,
        hex_code: newColorHex,
      });
      await refetch();
      setSelectedColors(prev => [...prev, color.id]);
      setIsAddingColor(false);
      setNewColorEn('');
      setNewColorAr('');
      setNewColorHex('#000000');
      toast.success("Color added successfully");
    } catch (e) {
      toast.error("Failed to add color");
    } finally {
      setIsSavingColor(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    try {
      setIsUploading(true);
      const files = Array.from(e.target.files);
      const newImages: { file_path: string; color_id: string | null; chain_option_value_id: string | null; is_main: number }[] = [];

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
            color_id: null,
            chain_option_value_id: null,
            is_main: productImages.length === 0 && newImages.length === 0 ? 1 : 0
        });
      }

      setProductImages(prev => [...prev, ...newImages]);

    } catch (error) {
      toast.error("Failed to upload images");
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
        main_image_second: mainImageSecond ? 1 : 0,
        color_ids: selectedColors,
        images: productImages,
        related_product_ids: selectedRelated
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, inputData);
        toast.success("Product updated successfully");
      } else {
        await productService.create(inputData);
        toast.success("Product added successfully");
      }

      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ['products-data'] });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await productService.delete(deleteId);
      toast.success("Product deleted");
      queryClient.setQueryData(['products-data'], (old: any) => old ? { ...old, productsData: old.productsData.filter((p: Product) => p.id !== deleteId) } : old);
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    isHighlight,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    isHighlight?: boolean;
  }) => (
    <div
      className={`stat-card ${isHighlight ? 'highlight' : ''}`}
    >
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className="stat-icon">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );

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

        {/* Stats Grid Skeleton */}
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card animate-pulse">
               <div className="stat-header mb-4">
                 <div className="h-4 w-24 bg-gray-200 rounded"></div>
                 <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
               </div>
               <div className="h-10 w-32 bg-gray-200 rounded mb-1 mt-2"></div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 animate-pulse">
          <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
          <div className="w-full md:w-48 h-10 bg-gray-200 rounded-xl"></div>
          <div className="w-full md:w-28 h-10 bg-gray-200 rounded-xl"></div>
        </div>

        {/* Table Skeleton */}
        <div className="content-card">
          <div className="table-wrapper">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></th>
                  <th><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></th>
                  <th><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></th>
                  <th><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="text-right"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div></th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse flex-shrink-0"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                    <td><div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div></td>
                    <td>
                      <div className="space-y-2">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td>
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(j => (
                          <div key={j} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 animate-pulse"></div>
                        ))}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gray-200 animate-pulse"></div>
                        <div className="w-8 h-8 rounded-xl bg-gray-200 animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const totalProducts = products.length;
  const categoriesCount = new Set(products.map(p => p.category_id)).size;
  const badgesCount = products.filter(p => p.badge).length;
  const avgPrice = totalProducts ? Math.round(products.reduce((acc, p) => acc + p.base_price, 0) / totalProducts) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="Manage Products"
        subtitle="All store products"
        actions={
          <Button onClick={() => handleOpenModal()} className="rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white px-5">
            <Plus size={18} className="mr-2" />
            New Product
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard title="Total Products" value={totalProducts} icon={PackageSearch} isHighlight={true} />
        <StatCard title="Categories Used" value={categoriesCount} icon={FolderTree} />
        <StatCard title="Active Badges" value={badgesCount} icon={Tag} />
        <StatCard title="Avg Price" value={`${avgPrice} EGP`} icon={DollarSign} />
      </div>

      {/* Filters & Actions */}
      {activeTab === "all" && (
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 rounded-xl">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()} className="rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </Card>
      )}

      {/* Main Tabs UI */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="new_arrival">New Arrivals</TabsTrigger>
          <TabsTrigger value="best_seller">Best Sellers</TabsTrigger>
          <TabsTrigger value="our_collection">Our Collection</TabsTrigger>
          <TabsTrigger value="categories">Category Sorting</TabsTrigger>
        </TabsList>

        <TabsContent value="all">

      {/* Products — Desktop Table */}
      <div className="content-card hidden md:block">
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Badge</th>
                        <th>Price</th>
                        <th className="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center text-gray-500 py-12">
                                No products available
                            </td>
                        </tr>
                    ) : (
                        filteredProducts.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-100 overflow-hidden flex-shrink-0">
                                            {product.main_image ? (
                                                <DropboxImg src={product.main_image} alt={product.name_en} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{product.name_en}</h3>
                                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{product.material_en}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <Select 
                                      value={product.category_id} 
                                      onValueChange={(val) => handleSetCategory(product.id, val)}
                                    >
                                      <SelectTrigger className="w-[140px] h-8 text-xs rounded-lg border-gray-200">
                                        <SelectValue placeholder="Category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map(cat => (
                                          <SelectItem key={cat.id} value={cat.id}>{cat.name_en}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                </td>
                                <td>
                                    <Select 
                                      value={product.badge || "none"} 
                                      onValueChange={(val) => handleSetBadge(product.id, val as ProductBadge)}
                                    >
                                      <SelectTrigger className="w-[120px] h-8 text-xs rounded-lg border-gray-200">
                                        <SelectValue placeholder="Badge" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {BADGE_OPTIONS.map(opt => (
                                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{product.base_price} EGP</span>
                                        {product.compare_at_price && (
                                            <span className="text-xs text-gray-400 line-through">{product.compare_at_price} EGP</span>
                                        )}
                                    </div>
                                </td>
                                <td className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleOpenModal(product)}
                                            className="rounded-xl text-gray-400 hover:text-primary"
                                        >
                                            <Pencil size={18} />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setDeleteId(product.id)}
                                            className="rounded-xl text-gray-400 hover:text-red-500"
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

      {/* Products — Mobile Cards */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        {filteredProducts.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
            No products available
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleOpenModal(product)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer active:bg-gray-50 transition-colors group"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                {product.main_image ? (
                  <DropboxImg src={product.main_image} alt={product.name_en} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={32} />
                  </div>
                )}
                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-2 right-2 bg-indigo-600 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-md uppercase">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <h3 className="font-semibold text-gray-900 text-xs leading-tight line-clamp-2 mb-1">
                  {product.name_en}
                </h3>
                <span className="text-[0.6rem] text-gray-400 font-medium uppercase tracking-wider">
                  {product.category?.name_en || ""}
                </span>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-gray-900 text-sm">{product.base_price}</span>
                    <span className="text-[0.6rem] text-gray-500">EGP</span>
                  </div>
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex -space-x-1.5">
                      {product.colors.slice(0, 3).map((color, i) => (
                        <div 
                          key={i}
                          className="w-4 h-4 rounded-full border-2 border-white"
                          style={{ backgroundColor: color.hex_code }}
                        />
                      ))}
                      {product.colors.length > 3 && (
                        <span className="text-[0.55rem] text-gray-400 ml-1">+{product.colors.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                {product.compare_at_price && (
                  <span className="text-[0.65rem] text-gray-400 line-through">{product.compare_at_price} EGP</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      </TabsContent>

      <TabsContent value="new_arrival">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Reorder New Arrivals</h3>
          <DraggableProductList 
            products={[...products].filter(p => p.badge === 'new_arrival').sort((a, b) => (a.badge_order || 0) - (b.badge_order || 0))}
            onSave={handleSaveBadgeOrder}
          />
        </Card>
      </TabsContent>

      <TabsContent value="best_seller">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Reorder Best Sellers</h3>
          <DraggableProductList 
            products={[...products].filter(p => p.badge === 'best_seller').sort((a, b) => (a.badge_order || 0) - (b.badge_order || 0))}
            onSave={handleSaveBadgeOrder}
          />
        </Card>
      </TabsContent>

      <TabsContent value="our_collection">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Reorder Our Collection (All Products)</h3>
          <DraggableProductList 
            products={[...products].sort((a, b) => (a.global_order || 0) - (b.global_order || 0))}
            onSave={handleSaveGlobalOrder}
          />
        </Card>
      </TabsContent>

      <TabsContent value="categories">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Category Order</h3>
            <Select 
              value={sortCategoryId || (categories.length > 0 ? categories[0].id : '')} 
              onValueChange={setSortCategoryId}
            >
              <SelectTrigger className="w-64 border-gray-200">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {categories.length === 0 ? (
            <p className="text-gray-500 text-sm">No categories available to reorder.</p>
          ) : (
            <DraggableProductList 
              products={[...products]
                .filter(p => p.category_id === (sortCategoryId || categories[0]?.id))
                .sort((a, b) => (a.category_order || 0) - (b.category_order || 0))}
              onSave={handleSaveCategoryOrder}
            />
          )}
        </Card>
      </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white shadow-2xl rounded-2xl max-h-[90vh] flex flex-col" dir="ltr">
          {/* Header + Step Indicator */}
          <div className="bg-gray-50 px-5 md:px-8 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
            <DialogTitle className="text-lg md:text-2xl text-gray-900 font-bold mb-4">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>

            {/* Step Indicator */}
            <div className="flex items-center gap-1">
              {STEPS.map((step, i) => (
                <div key={step.key} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => setFormStep(i)}
                    className={`flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      i === formStep
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : i < formStep
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-bold shrink-0 ${
                      i === formStep ? 'bg-white/20 text-white' : i < formStep ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {i < formStep ? <Check size={10} /> : i + 1}
                    </span>
                    <span className="hidden sm:inline truncate">{step.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-5 md:px-8 py-5">

            {/* Loading state while fetching product */}
            {isLoadingProduct ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <p className="text-sm text-gray-400 font-medium">Loading product...</p>
              </div>
            ) : (
            <>
            {/* Step 1: Basic Info */}
            {formStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className="rounded-xl h-11" dir="ltr" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badge">Badge</Label>
                    <Select value={badge || "none"} onValueChange={setBadge}>
                      <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        {BADGE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Compare Price</Label>
                    <Input id="comparePrice" type="number" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="0" className="rounded-xl h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input id="material" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g. Leather, Canvas..." className="rounded-xl h-11" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl" placeholder="Product description..." dir="ltr" />
                </div>
              </div>
            )}

            {/* Step 2: Colors */}
            {formStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search colors..."
                      value={colorSearch}
                      onChange={(e) => setColorSearch(e.target.value)}
                      className="w-full pl-9 pr-3 h-10 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-indigo-300 focus:bg-white transition-colors"
                    />
                  </div>
                  {selectedColors.length > 0 && (
                    <span className="h-10 px-3 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center gap-1.5 shrink-0">
                      <Check size={12} />
                      {selectedColors.length}
                    </span>
                  )}
                </div>
                {/* Selected colors summary */}
                {selectedColors.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100 mb-1">
                    {colors.filter(c => selectedColors.includes(c.id)).map(c => (
                      <span key={c.id} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-800">
                        <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-indigo-200" style={{ backgroundColor: c.hex_code }} />
                        {c.name_en}
                        <button type="button" onClick={() => setSelectedColors(prev => prev.filter(id => id !== c.id))} className="ml-0.5 text-indigo-400 hover:text-indigo-700">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto">
                  {colors
                    .filter(c => c.name_en.toLowerCase().includes(colorSearch.toLowerCase()))
                    .map(color => {
                      const isSelected = selectedColors.includes(color.id);
                      return (
                        <div 
                          key={color.id}
                          onClick={() => {
                            if (isSelected) setSelectedColors(prev => prev.filter(c => c !== color.id));
                            else setSelectedColors(prev => [...prev, color.id]);
                          }}
                          className={`
                            cursor-pointer rounded-xl p-3 border-2 transition-all flex items-center gap-3
                            ${isSelected 
                              ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100' 
                              : 'border-gray-100 bg-white hover:border-gray-200'
                            }
                          `}
                        >
                          <div 
                            className={`w-7 h-7 rounded-full shadow-sm flex items-center justify-center shrink-0 ${isSelected ? 'ring-2 ring-indigo-300' : 'border border-gray-200'}`}
                            style={{ backgroundColor: color.hex_code }}
                          >
                            {isSelected && <Check size={12} className={color.hex_code.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'} strokeWidth={3} />}
                          </div>
                          <span className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>{color.name_en}</span>
                        </div>
                      );
                    })}
                </div>
                {colors.filter(c => c.name_en.toLowerCase().includes(colorSearch.toLowerCase())).length === 0 && colors.length > 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No colors match &quot;{colorSearch}&quot;</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingColor(!isAddingColor)}
                    className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus size={16} /> Add New Color
                  </button>
                </div>
                
                {isAddingColor && (
                  <div className="p-3 bg-gray-50 border rounded-xl space-y-3 mt-2 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Name (English)</Label>
                        <Input value={newColorEn} onChange={e => setNewColorEn(e.target.value)} placeholder="e.g. Red" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Name (Arabic)</Label>
                        <Input value={newColorAr} onChange={e => setNewColorAr(e.target.value)} placeholder="مثال: أحمر" className="h-8 text-sm" dir="rtl" />
                      </div>
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="space-y-1 flex-1">
                        <Label className="text-xs text-gray-500">Hex Code</Label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={newColorHex} onChange={e => setNewColorHex(e.target.value)} className="w-8 h-8 rounded border cursor-pointer p-0" />
                          <Input value={newColorHex} onChange={e => setNewColorHex(e.target.value)} className="h-8 text-sm uppercase" />
                        </div>
                      </div>
                      <Button 
                        type="button"
                        onClick={handleAddColor} 
                        disabled={isSavingColor || !newColorEn || !newColorAr}
                        className="h-8 px-4"
                      >
                        {isSavingColor ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Color'}
                      </Button>
                    </div>
                  </div>
                )}
                {colors.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No colors configured yet</p>}
              </div>
            )}

            {/* Step 3: Images */}
            {formStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Upload product photos and assign colors</p>

                {/* Main Image Position Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Main image position</p>
                    <p className="text-xs text-gray-400">Show main image as 2nd photo in gallery</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMainImageSecond(!mainImageSecond)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${mainImageSecond ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${mainImageSecond ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Upload Box */}
                <div className="relative group cursor-pointer w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden">
                  <input 
                    type="file" multiple accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <Loader2 className="animate-spin text-primary" size={28} />
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <ImageIcon size={18} />
                      </div>
                      <p className="text-xs font-medium text-gray-500">Tap to upload images</p>
                    </>
                  )}
                </div>

                {/* Image List */}
                <div className="space-y-2.5 max-h-[40vh] overflow-y-auto">
                  {productImages.map((img, idx) => (
                    <div key={idx} className="flex gap-3 p-2.5 border border-gray-100 rounded-xl bg-gray-50 items-center">
                      <div className="w-14 h-14 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0">
                        <DropboxImg src={img.file_path} alt="Product image" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <Select 
                          value={img.color_id || "none"} 
                          onValueChange={(val) => handleImageColorChange(idx, val)}
                          dir="ltr"
                        >
                          <SelectTrigger className="h-8 text-xs rounded-lg">
                            <SelectValue placeholder="Color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">General</SelectItem>
                            {colors.filter(c => selectedColors.includes(c.id)).map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {chainOptions.length > 0 && (
                          <Select 
                            value={img.chain_option_value_id || "none"} 
                            onValueChange={(val) => {
                              const updated = [...productImages];
                              updated[idx] = { ...updated[idx], chain_option_value_id: val === "none" ? null : val };
                              setProductImages(updated);
                            }}
                            dir="ltr"
                          >
                            <SelectTrigger className="h-8 text-xs rounded-lg">
                              <SelectValue placeholder="Chain" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Chain</SelectItem>
                              {chainOptions.map(opt => (
                                <SelectItem key={opt.id} value={opt.id}>{opt.value_en}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input type="radio" name="mainImage" checked={img.is_main === 1} onChange={() => handleSetMainImage(idx)} className="accent-primary" />
                            Main
                          </label>
                          <button type="button" onClick={() => handleRemoveImage(idx)} className="text-xs text-red-500 hover:underline">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Related Products */}
            {formStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Tap products to link them as recommendations</p>
                {selectedRelated.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                    <Check size={14} />
                    {selectedRelated.length} product{selectedRelated.length > 1 ? 's' : ''} selected
                  </div>
                )}
                <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                  {products.filter(p => !editingProduct || p.id !== editingProduct.id).map(prod => {
                    const isLinked = selectedRelated.includes(prod.id);
                    return (
                      <div 
                        key={prod.id} 
                        onClick={() => {
                          if (isLinked) setSelectedRelated(prev => prev.filter(id => id !== prod.id));
                          else setSelectedRelated(prev => [...prev, prod.id]);
                        }}
                        className={`
                          flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all
                          ${isLinked 
                            ? 'bg-indigo-50 border-2 border-indigo-200 ring-1 ring-indigo-100' 
                            : 'bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                          }
                        `}
                      >
                        {/* Product Thumbnail */}
                        <div className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 relative ${isLinked ? 'ring-2 ring-indigo-300' : 'border border-gray-100'}`}>
                          {prod.main_image ? (
                            <DropboxImg src={prod.main_image} alt={prod.name_en} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                              <ImageIcon size={16} className="text-gray-300" />
                            </div>
                          )}
                          {isLinked && (
                            <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                              <Check size={16} className="text-white drop-shadow" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-semibold truncate ${isLinked ? 'text-indigo-900' : 'text-gray-900'}`}>
                            {prod.name_en}
                          </h4>
                          <p className="text-[0.65rem] text-gray-400 uppercase tracking-wider">
                            {prod.category?.name_en || ''}
                          </p>
                        </div>

                        {/* Price */}
                        <span className={`text-xs font-bold shrink-0 ${isLinked ? 'text-indigo-600' : 'text-gray-500'}`}>
                          {prod.base_price} EGP
                        </span>
                      </div>
                    );
                  })}
                  {products.length <= (editingProduct ? 1 : 0) && (
                    <div className="text-center py-10">
                      <Package size={32} className="text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No other products to link</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            </>
            )}

          </div>

          {/* Footer: Back / Next / Save */}
          <div className="bg-gray-50 px-5 md:px-8 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
            {formStep > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFormStep(s => s - 1)}
                className="h-11 rounded-xl border-gray-200 text-gray-600 px-4"
              >
                <ChevronLeft size={16} className="mr-1" />
                Back
              </Button>
            )}
            <div className="flex-1" />
            {formStep < STEPS.length - 1 ? (
              <Button 
                type="button"
                onClick={() => setFormStep(s => s + 1)}
                className="h-11 rounded-xl px-6"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting} 
                className="h-11 rounded-xl px-6 shadow-lg"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 animate-spin" size={16} /> Saving...</>
                ) : (
                  <><Save className="mr-2" size={16} /> Save Product</>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-[32px] border-none shadow-2xl" dir="ltr">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Are you sure you want to delete this product?
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

export default ProductsPage;

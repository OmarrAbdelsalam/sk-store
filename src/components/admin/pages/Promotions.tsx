"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Ticket, Zap, Gift, Truck, Plus, Search,
  CheckCircle2, XCircle, Clock, Pencil, Trash2, Calendar as CalendarLucide, DollarSign, Check, Image as ImageIcon, Loader2
} from "lucide-react";
import { PageHeader, Card } from "@/components/admin/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/products";
import { categoryService } from "@/services/categories";
import { DropboxImg } from "@/components/DropboxImage";
import { promotionService } from "@/services/promotions";

type PromoTab = 'discount_codes' | 'get_gift' | 'bogo' | 'free_shipping';

interface BasePromo {
  id: string;
  name: string;
  status: 'Active' | 'Scheduled' | 'Expired';
  expires: string;
}

interface PromoCode extends BasePromo {
  type: string;
  value: string;
  usage: string;
  productIds?: string[];
  usageLimit?: string;
}

interface GetGift extends BasePromo {
  productIds: string[];
  giftName: string;
}

interface Bogo extends BasePromo {
  productIds: string[];
}

interface FreeShipping extends BasePromo {
  minOrder: string;
}

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState<PromoTab>('discount_codes');
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ── React Query data fetching ─────────────────────────────────────────────

  const { data: rawCodes = [], isLoading: isLoadingCodes, refetch: refetchCodes } = useQuery({
    queryKey: ['admin-promo-codes'],
    queryFn: () => promotionService.getAllPromoCodes(),
  });

  const { data: rawGifts = [], isLoading: isLoadingGifts, refetch: refetchGifts } = useQuery({
    queryKey: ['admin-quick-promos', 'free_gift_min_amount'],
    queryFn: () => promotionService.getQuickPromotions('free_gift_min_amount'),
  });

  const { data: rawBogos = [], isLoading: isLoadingBogos, refetch: refetchBogos } = useQuery({
    queryKey: ['admin-quick-promos', 'buy_x_get_y_free'],
    queryFn: () => promotionService.getQuickPromotions('buy_x_get_y_free'),
  });

  const { data: rawFreeShipping = [], isLoading: isLoadingFreeShipping, refetch: refetchFreeShipping } = useQuery({
    queryKey: ['admin-quick-promos', 'free_shipping_min_amount'],
    queryFn: () => promotionService.getQuickPromotions('free_shipping_min_amount'),
  });

  // ── Map Supabase data to UI format ────────────────────────────────────────

  const discountCodes: PromoCode[] = rawCodes.map(c => ({
    id: c.id,
    name: c.code,
    type: c.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount',
    value: c.discount_value.toString(),
    usage: `${c.usage_count} / ${c.usage_limit ?? 'Unlimited'}`,
    usageLimit: c.usage_limit?.toString() ?? '',
    expires: c.end_date ?? 'Never',
    status: c.is_active ? 'Active' : 'Expired',
    productIds: [],
  }));

  const getGifts: GetGift[] = rawGifts.map(g => ({
    id: g.id,
    name: g.name_en,
    giftName: g.badge_text_en ?? '',
    productIds: (() => { try { return JSON.parse(g.product_ids ?? '[]'); } catch { return []; } })(),
    expires: g.end_date ?? 'Never',
    status: g.is_active ? 'Active' : 'Expired',
  }));

  const bogos: Bogo[] = rawBogos.map(b => ({
    id: b.id,
    name: b.name_en,
    productIds: (() => { try { return JSON.parse(b.product_ids ?? '[]'); } catch { return []; } })(),
    expires: b.end_date ?? 'Never',
    status: b.is_active ? 'Active' : 'Expired',
  }));

  const freeShippingList = rawFreeShipping;
  const freeShippingRecord = freeShippingList[0] ?? null;
  const [freeShippingConfig, setFreeShippingConfig] = useState({ minOrder: '', isActive: false });

  // Sync freeShippingConfig from fetched data when it first arrives
  useEffect(() => {
    if (!isLoadingFreeShipping) {
      setFreeShippingConfig({
        minOrder: freeShippingRecord?.min_amount?.toString() ?? '',
        isActive: freeShippingRecord?.is_active === 1,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingFreeShipping]);

  const tabs = [
    { id: 'discount_codes' as PromoTab, label: 'Discount Codes', icon: Ticket, count: discountCodes.length },
    { id: 'get_gift' as PromoTab, label: 'Get Gift', icon: Zap, count: getGifts.length },
    { id: 'bogo' as PromoTab, label: 'Buy 1 Get 1', icon: Gift, count: bogos.length },
    { id: 'free_shipping' as PromoTab, label: 'Free Shipping', icon: Truck, count: freeShippingRecord?.is_active === 1 ? 1 : 0 },
  ];

  const { data: storeData } = useQuery({
    queryKey: ['promo-store-data'],
    queryFn: async () => {
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);
      return { productsData, categoriesData };
    },
    staleTime: 5 * 60 * 1000,
  });
  const products = storeData?.productsData || [];
  const categories = storeData?.categoriesData || [];

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [formData, setFormData] = useState<any>({});

  const handleOpenModal = (item?: any) => {
    setCurrentStep(1);
    if (item) {
      setEditingItem(item);
      // Pre-populate formData from the UI-mapped item (reverse mapping already done above)
      setFormData({
        ...item,
        // Ensure all fields exist
        type: item.type ?? 'Percentage',
        value: item.value ?? '',
        usageLimit: item.usageLimit ?? '',
        giftName: item.giftName ?? '',
        minOrder: item.minOrder ?? '',
        productIds: item.productIds ?? [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        status: 'Active',
        expires: 'Never',
        type: 'Percentage',
        value: '',
        usage: '0 / Unlimited',
        usageLimit: '',
        discount: '',
        giftName: '',
        productIds: [],
        minOrder: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setCurrentStep(1);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Please enter a name/code");
      return;
    }

    setIsSaving(true);
    try {
      if (activeTab === 'discount_codes') {
        const input = {
          code: formData.name.toUpperCase(),
          discount_type: formData.type === 'Percentage' ? 'percentage' as const : 'fixed' as const,
          discount_value: parseFloat(formData.value) || 0,
          usage_limit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          end_date: formData.expires === 'Never' ? null : formData.expires,
          is_active: formData.status === 'Active' ? 1 : 0,
          first_order_only_check: formData.first_order_only_check ?? false,
          one_use_per_phone: formData.one_use_per_phone ?? false,
        };
        if (editingItem) {
          await promotionService.updatePromoCode(editingItem.id, input);
        } else {
          await promotionService.createPromoCode(input);
        }
        await refetchCodes();

      } else if (activeTab === 'get_gift') {
        if (!formData.productIds?.length) {
          toast.error("Please select at least one product");
          setIsSaving(false);
          return;
        }
        const input = {
          promo_type: 'free_gift_min_amount' as const,
          name_en: formData.name,
          name_ar: formData.name,
          badge_text_en: formData.giftName || null,
          badge_text_ar: formData.giftName || null,
          product_ids: JSON.stringify(formData.productIds),
          applies_to: 'product' as const,
          end_date: formData.expires === 'Never' ? null : formData.expires,
          is_active: formData.status === 'Active' ? 1 : 0,
        };
        if (editingItem) {
          await promotionService.updateQuickPromotion(editingItem.id, input);
        } else {
          await promotionService.createQuickPromotion(input);
        }
        await refetchGifts();

      } else if (activeTab === 'bogo') {
        if (!formData.productIds?.length) {
          toast.error("Please select at least one product");
          setIsSaving(false);
          return;
        }
        const input = {
          promo_type: 'buy_x_get_y_free' as const,
          name_en: formData.name,
          name_ar: formData.name,
          product_ids: JSON.stringify(formData.productIds),
          applies_to: 'product' as const,
          buy_quantity: 2,
          get_quantity: 1,
          discount_type: 'free' as const,
          end_date: formData.expires === 'Never' ? null : formData.expires,
          is_active: formData.status === 'Active' ? 1 : 0,
        };
        if (editingItem) {
          await promotionService.updateQuickPromotion(editingItem.id, input);
        } else {
          await promotionService.createQuickPromotion(input);
        }
        await refetchBogos();
      }

      toast.success(`${editingItem ? 'Updated' : 'Created'} successfully!`);
      handleCloseModal();
    } catch (err: any) {
      toast.error(err?.message ?? 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      if (activeTab === 'discount_codes') {
        await promotionService.deletePromoCode(deleteId);
        await refetchCodes();
      } else if (activeTab === 'get_gift') {
        await promotionService.deactivateQuickPromotion(deleteId);
        await refetchGifts();
      } else if (activeTab === 'bogo') {
        await promotionService.deactivateQuickPromotion(deleteId);
        await refetchBogos();
      }
      toast.success("Deleted successfully!");
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete');
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Active': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3" /> Active</span>;
      case 'Scheduled': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Scheduled</span>;
      case 'Expired': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1 w-max"><XCircle className="w-3 h-3" /> Expired</span>;
      default: return null;
    }
  };

  const isLoadingCurrentTab = () => {
    if (activeTab === 'discount_codes') return isLoadingCodes;
    if (activeTab === 'get_gift') return isLoadingGifts;
    if (activeTab === 'bogo') return isLoadingBogos;
    if (activeTab === 'free_shipping') return isLoadingFreeShipping;
    return false;
  };

  const getCurrentList = () => {
    let list: any[] = [];
    if (activeTab === 'discount_codes') list = discountCodes;
    if (activeTab === 'get_gift') list = getGifts;
    if (activeTab === 'bogo') list = bogos;

    if (searchQuery) {
      list = list.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  };

  const renderTableHeaders = () => {
    if (activeTab === 'discount_codes') return (
      <>
        <th className="px-6 py-4 font-semibold">Code</th>
        <th className="px-6 py-4 font-semibold">Type</th>
        <th className="px-6 py-4 font-semibold">Value</th>
        <th className="px-6 py-4 font-semibold">Usage</th>
      </>
    );
    if (activeTab === 'get_gift') return (
      <>
        <th className="px-6 py-4 font-semibold">Name</th>
        <th className="px-6 py-4 font-semibold">Gift</th>
        <th className="px-6 py-4 font-semibold">Applies To</th>
      </>
    );
    if (activeTab === 'bogo') return (
      <>
        <th className="px-6 py-4 font-semibold">Name</th>
        <th className="px-6 py-4 font-semibold">Included Products</th>
      </>
    );
    if (activeTab === 'free_shipping') return (
      <>
        <th className="px-6 py-4 font-semibold">Name</th>
        <th className="px-6 py-4 font-semibold">Min Order</th>
      </>
    );
  };

  const renderTableCells = (item: any) => {
    if (activeTab === 'discount_codes') return (
      <>
        <td className="px-6 py-4"><span className="font-bold text-gray-900 px-2 py-1 bg-gray-100 rounded-md tracking-wider">{item.name}</span></td>
        <td className="px-6 py-4 text-gray-600">{item.type}</td>
        <td className="px-6 py-4 font-medium text-primary">
          {item.value}{item.type === 'Percentage' ? '%' : ' EGP'}
        </td>
        <td className="px-6 py-4 text-gray-600">
          <div className="flex flex-col gap-0.5">
            <span>{item.usage}</span>
            {item.productIds?.length > 0 && (
              <span className="text-[0.6rem] text-indigo-600 font-semibold">
                {item.productIds.length === products.length ? 'All Products' : `${item.productIds.length} Products`}
              </span>
            )}
          </div>
        </td>
      </>
    );
    if (activeTab === 'get_gift') return (
      <>
        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
        <td className="px-6 py-4 text-primary font-medium">{item.giftName}</td>
        <td className="px-6 py-4 text-gray-600">
          {item.productIds?.length ? `${item.productIds.length} Products` : 'None'}
        </td>
      </>
    );
    if (activeTab === 'bogo') return (
      <>
        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
        <td className="px-6 py-4 text-gray-600">
          {item.productIds?.length ? `${item.productIds.length} Products` : 'None'}
        </td>
      </>
    );
    if (activeTab === 'free_shipping') return (
      <>
        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
        <td className="px-6 py-4 text-gray-600">{item.minOrder}</td>
      </>
    );
  };

  const renderFormFields = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label>{activeTab === 'discount_codes' ? 'Code Name' : 'Promotion Name'}</Label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            placeholder={activeTab === 'discount_codes' ? "e.g. SUMMER20" : "e.g. Black Friday Sale"}
            className="mt-1"
          />
        </div>

        {activeTab === 'discount_codes' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount Type</Label>
              <Select value={formData.type} onValueChange={(v) => {
                let newVal = formData.value;
                if (v === 'Percentage' && parseInt(newVal) > 100) newVal = '100';
                setFormData({...formData, type: v, value: newVal});
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                  <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <div className="relative mt-1">
                <Input 
                  type="number"
                  value={formData.value || ""} 
                  onChange={(e) => {
                    let val = e.target.value;
                    if (formData.type === 'Percentage') {
                      let num = parseInt(val);
                      if (!isNaN(num)) {
                        if (num > 100) val = '100';
                        if (num < 1) val = '1';
                      }
                    }
                    setFormData({...formData, value: val});
                  }} 
                  placeholder={formData.type === 'Percentage' ? "1-100" : "Amount"}
                  className="pr-12"
                  min={formData.type === 'Percentage' ? 1 : 0}
                  max={formData.type === 'Percentage' ? 100 : undefined}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                  {formData.type === 'Percentage' ? '%' : 'EGP'}
                </span>
              </div>
            </div>
            <div className="col-span-2">
              <Label>Usage Limit</Label>
              <Input 
                type="number"
                value={formData.usageLimit || ""} 
                onChange={(e) => setFormData({...formData, usageLimit: e.target.value})} 
                placeholder="Leave blank for unlimited"
                className="mt-1"
                min={1}
              />
            </div>

            {/* Restrictions */}
            <div className="col-span-2 space-y-3 pt-2 border-t border-gray-100">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Restrictions</Label>

              {/* First Order Only */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => setFormData({...formData, first_order_only_check: !formData.first_order_only_check})}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.first_order_only_check ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white group-hover:border-indigo-400'
                  }`}
                >
                  {formData.first_order_only_check && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">First Order Only</p>
                  <p className="text-xs text-gray-400 mt-0.5">Valid only if the customer has no previous orders (checked by session ID + phone number)</p>
                </div>
              </label>

              {/* One Use Per Phone */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => setFormData({...formData, one_use_per_phone: !formData.one_use_per_phone})}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.one_use_per_phone ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white group-hover:border-indigo-400'
                  }`}
                >
                  {formData.one_use_per_phone && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">One Use Per Phone Number</p>
                  <p className="text-xs text-gray-400 mt-0.5">Each phone number can only use this code once, regardless of order count</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'get_gift' && (
          <div>
            <Label>Free Gift Description</Label>
            <Input 
              value={formData.giftName || ""} 
              onChange={(e) => setFormData({...formData, giftName: e.target.value})} 
              placeholder="e.g. Free Shampoo or Leather Wallet"
              className="mt-1"
            />
            <p className="text-[0.65rem] text-gray-400 mt-1">This will be displayed on the product page as "Get [Gift Name] Free!"</p>
          </div>
        )}

        {activeTab === 'free_shipping' && (
          <div>
            <Label>Minimum Order Value</Label>
            <Input 
              value={formData.minOrder} 
              onChange={(e) => setFormData({...formData, minOrder: e.target.value})} 
              placeholder="e.g. 1500 EGP"
              className="mt-1"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Expires</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="mt-1 w-full flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <CalendarLucide size={14} className="text-gray-400 shrink-0" />
                  <span className={formData.expires === 'Never' ? 'text-gray-400' : 'text-gray-900'}>
                    {formData.expires === 'Never' ? 'No expiry' : new Date(formData.expires).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-2 border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, expires: 'Never'})}
                    className={`w-full text-left text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                      formData.expires === 'Never' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    No expiry date
                  </button>
                </div>
                <Calendar
                  mode="single"
                  selected={formData.expires !== 'Never' ? new Date(formData.expires) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formatted = date.toISOString().split('T')[0];
                      setFormData({...formData, expires: formatted});
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    );
  };

  const renderProductSelection = () => {
    if (activeTab === 'free_shipping') return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Included Products</Label>
            {formData.productIds?.length > 0 && (
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {formData.productIds.length} selected
              </span>
            )}
          </div>
          
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => {
               const allProductIds = products.map((p: any) => p.id);
               if (formData.productIds?.length === allProductIds.length && allProductIds.length > 0) {
                  setFormData({...formData, productIds: []});
               } else {
                  setFormData({...formData, productIds: allProductIds});
               }
            }}
          >
            <span className="text-xs font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Select All Products</span>
            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
              formData.productIds?.length === products.length && products.length > 0 ? 'bg-indigo-600 border-indigo-600 text-white' : 
              formData.productIds?.length > 0 ? 'bg-indigo-100 border-indigo-400 text-indigo-600' : 'border-gray-300 bg-white group-hover:border-gray-400'
            }`}>
              {formData.productIds?.length > 0 && <Check size={12} strokeWidth={formData.productIds.length === products.length ? 3 : 4} className={formData.productIds.length !== products.length ? 'opacity-50' : ''} />}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="max-h-[320px] overflow-y-auto">
            {categories.map(cat => {
              const catProducts = products.filter(p => p.category_id === cat.id);
              if (catProducts.length === 0) return null;

              const selectedCatProducts = catProducts.filter(p => formData.productIds?.includes(p.id));
              const isAllSelected = selectedCatProducts.length === catProducts.length;
              const isSomeSelected = selectedCatProducts.length > 0 && !isAllSelected;
              const isExpanded = expandedCategories.includes(cat.id);

              return (
                <div key={cat.id} className="border-b border-gray-100 last:border-0">
                  {/* Category Header */}
                  <div className={`flex items-center gap-3 p-3 transition-colors ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                    {/* Checkbox */}
                    <div 
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        isAllSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 
                        isSomeSelected ? 'bg-indigo-100 border-indigo-400 text-indigo-600' : 
                        'border-gray-300 bg-white'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const productIds = catProducts.map(p => p.id);
                        if (isAllSelected) {
                          setFormData({...formData, productIds: (formData.productIds || []).filter((id: string) => !productIds.includes(id))});
                        } else {
                          const newIds = new Set([...(formData.productIds || []), ...productIds]);
                          setFormData({...formData, productIds: Array.from(newIds)});
                          if (!isExpanded) {
                            setExpandedCategories(prev => [...prev, cat.id]);
                          }
                        }
                      }}
                    >
                      {(isAllSelected || isSomeSelected) && <Check size={12} strokeWidth={isSomeSelected ? 4 : 3} className={isSomeSelected ? 'opacity-50' : ''} />}
                    </div>

                    {/* Expandable Area */}
                    <div 
                      className="flex-1 flex items-center justify-between cursor-pointer select-none"
                      onClick={() => {
                        setExpandedCategories(prev => prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]);
                      }}
                    >
                      <span className="font-semibold text-gray-800 text-sm">{cat.name_en}</span>
                      <span className="text-xs text-gray-500 font-medium">
                        {selectedCatProducts.length} / {catProducts.length}
                      </span>
                    </div>
                  </div>

                  {/* Products List */}
                  {isExpanded && (
                    <div className="bg-gray-50/50 p-2 space-y-1 border-t border-gray-100">
                      {catProducts.map(prod => {
                        const isSelected = formData.productIds?.includes(prod.id);
                        return (
                          <div 
                            key={prod.id}
                            onClick={() => {
                              const current = formData.productIds || [];
                              setFormData({
                                ...formData, 
                                productIds: isSelected ? current.filter((id: string) => id !== prod.id) : [...current, prod.id]
                              });
                            }}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border shadow-sm ml-6 ${
                              isSelected ? 'bg-white border-indigo-200 shadow-indigo-100/30' : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && <Check size={10} strokeWidth={3} />}
                            </div>
                            
                            <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 border border-gray-100 bg-white">
                              {prod.main_image ? (
                                <DropboxImg src={prod.main_image} alt={prod.name_en} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                  <ImageIcon size={14} />
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col flex-1 min-w-0">
                              <span className={`text-xs truncate ${isSelected ? 'font-bold text-indigo-900' : 'text-gray-700 font-medium'}`}>
                                {prod.name_en}
                              </span>
                            </div>
                            
                            <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded-md ${isSelected ? 'text-indigo-700 bg-indigo-50' : 'text-gray-500 bg-gray-100'}`}>
                              {prod.base_price} EGP
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {activeTab === 'bogo' && (
          <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-100 flex gap-3 items-start shadow-sm">
            <Gift className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-900 mb-1">How BOGO works</p>
              <p className="opacity-90 leading-relaxed">
                When a customer adds any <strong>2 items</strong> from the selected pool to their cart, the cheapest item will be automatically discounted to <strong>Free</strong>.
              </p>
            </div>
          </div>
        )}
        {activeTab === 'get_gift' && (
          <div className="bg-indigo-50 text-indigo-800 p-3.5 rounded-xl border border-indigo-100 flex gap-3 items-start shadow-sm">
            <Gift className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-indigo-900 mb-1">How Get Gift works</p>
              <p className="opacity-90 leading-relaxed">
                When a customer buys any of the selected products, they will automatically receive the gift (<strong>{formData.giftName || "Gift"}</strong>).
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const currentList = getCurrentList();

  return (
    <div className="space-y-6" dir="ltr">
      <PageHeader
        title="Promotions & Offers"
        subtitle="Manage all your store discounts, flash sales, and special offers in one place."
        icon={Ticket}
        actions={
          <Button onClick={() => handleOpenModal()} className="rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white px-5">
            <Plus size={18} className="mr-2" />
            Create Promotion
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
        {tabs.map((tab) => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer transition-all duration-200 border rounded-2xl p-3 md:p-4 flex flex-col gap-2 md:gap-3 ${
              activeTab === tab.id 
                ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                : 'border-gray-200 bg-white hover:border-primary/40 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className="text-[0.6rem] md:text-xs font-semibold px-1.5 md:px-2 py-0.5 md:py-1 bg-white border rounded-md md:rounded-lg text-gray-500 shadow-sm">{tab.count} Total</span>
            </div>
            <div>
              <h3 className={`font-semibold text-xs md:text-sm ${activeTab === tab.id ? 'text-primary' : 'text-gray-900'}`}>{tab.label}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Free Shipping — Settings Card */}
      {activeTab === 'free_shipping' && (
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-sm">Free Shipping Settings</h3>
            <p className="text-xs text-gray-400 mt-0.5">Configure the minimum order value for free shipping</p>
          </div>
          <div className="p-5 space-y-5">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Enable Free Shipping</h4>
                <p className="text-xs text-gray-400 mt-0.5">Applies to all orders above the minimum</p>
              </div>
              <button
                onClick={async () => {
                  const newActive = !freeShippingConfig.isActive;
                  setFreeShippingConfig(prev => ({ ...prev, isActive: newActive }));
                  if (freeShippingRecord) {
                    try {
                      await promotionService.updateQuickPromotion(freeShippingRecord.id, {
                        is_active: newActive ? 1 : 0,
                      });
                      await refetchFreeShipping();
                    } catch (err: any) {
                      toast.error(err?.message ?? 'Failed to update');
                      setFreeShippingConfig(prev => ({ ...prev, isActive: !newActive }));
                    }
                  }
                }}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  freeShippingConfig.isActive ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  freeShippingConfig.isActive ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Min Order Input */}
            <div className={`space-y-2 transition-opacity ${freeShippingConfig.isActive ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <Label className="text-sm font-semibold text-gray-700">Minimum Order Value (EGP)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  value={freeShippingConfig.minOrder}
                  onChange={(e) => setFreeShippingConfig(prev => ({ ...prev, minOrder: e.target.value }))}
                  placeholder="e.g. 1500"
                  className="pl-9 h-12 rounded-xl text-lg font-bold"
                />
              </div>
              <p className="text-xs text-gray-400">Orders above this amount get free shipping automatically</p>
            </div>

            {/* Save */}
            <Button 
              onClick={async () => {
                const minOrderNum = parseFloat(freeShippingConfig.minOrder);
                if (!freeShippingConfig.minOrder || isNaN(minOrderNum) || minOrderNum <= 0) {
                  toast.error('Please enter a valid minimum order amount');
                  return;
                }
                setIsSaving(true);
                try {
                  if (freeShippingRecord) {
                    await promotionService.updateQuickPromotion(freeShippingRecord.id, {
                      min_amount: minOrderNum,
                      is_active: freeShippingConfig.isActive ? 1 : 0,
                    });
                  } else {
                    await promotionService.createQuickPromotion({
                      promo_type: 'free_shipping_min_amount',
                      name_en: 'Free Shipping',
                      name_ar: 'شحن مجاني',
                      applies_to: 'shipping',
                      min_amount: minOrderNum,
                      is_active: freeShippingConfig.isActive ? 1 : 0,
                    });
                  }
                  await refetchFreeShipping();
                  toast.success('Free shipping settings saved!');
                } catch (err: any) {
                  toast.error(err?.message ?? 'Failed to save');
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
              className="w-full h-11 rounded-xl shadow-md"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Settings
            </Button>
          </div>
        </Card>
      )}

      {/* Table/List Section — only for non-free_shipping tabs */}
      {activeTab !== 'free_shipping' && (
      <Card className="p-0 overflow-hidden">
        <div className="p-3 md:p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder={`Search ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl bg-white w-full md:w-64"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          {isLoadingCurrentTab() ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50/80 uppercase">
              <tr>
                {renderTableHeaders()}
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Expires</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {currentList.map((item, i) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 group"
                  >
                    {renderTableCells(item)}
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-gray-600">{item.expires}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => handleOpenModal(item)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setDeleteId(item.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {isLoadingCurrentTab() ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : currentList.map((item) => (
            <div 
              key={item.id} 
              className="p-3.5 flex items-start gap-3 active:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                {/* Name / Code */}
                {activeTab === 'discount_codes' ? (
                  <span className="font-bold text-gray-900 text-xs px-2 py-1 bg-gray-100 rounded-md tracking-wider inline-block mb-1">{item.name}</span>
                ) : (
                  <h4 className="font-semibold text-gray-900 text-sm truncate mb-1">{item.name}</h4>
                )}

                {/* Key Detail */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                  {activeTab === 'discount_codes' && (
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span>{item.type}</span><span className="text-gray-300">·</span><span className="font-semibold text-indigo-600">{item.value}{item.type === 'Percentage' ? '%' : ' EGP'}</span>
                      </div>
                      <span className="text-[0.6rem] text-gray-500">
                        Uses: {item.usage} {item.productIds?.length > 0 ? ` · ${item.productIds.length === products.length ? 'All' : item.productIds.length} Products` : ' · No Products'}
                      </span>
                    </div>
                  )}
                  {activeTab === 'get_gift' && (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-indigo-600 truncate">{item.giftName}</span>
                      <span className="text-[0.6rem] text-gray-500">
                        {item.productIds?.length ? `${item.productIds.length} Products` : 'None'}
                      </span>
                    </div>
                  )}
                  {activeTab === 'bogo' && (
                    <>
                      <span>
                        {item.productIds?.length ? `${item.productIds.length} Products` : 'None'}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <Gift className="w-3 h-3" /> Cheapest is Free
                      </span>
                    </>
                  )}
                  {(activeTab as string) === 'free_shipping' && (
                    <span>Min: <span className="font-semibold">{item.minOrder}</span></span>
                  )}
                </div>

                {/* Status + Expiry row */}
                <div className="flex items-center gap-2">
                  {getStatusBadge(item.status)}
                  <span className="text-[0.6rem] text-gray-400">Exp: {item.expires}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                <button onClick={() => handleOpenModal(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteId(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {!isLoadingCurrentTab() && currentList.length === 0 && (activeTab as string) !== 'free_shipping' && (
          <div className="p-12 text-center text-gray-500">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No promotions found</h3>
            <p className="text-sm">Get started by creating your first promotional offer.</p>
            <Button onClick={() => handleOpenModal()} className="mt-4 rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white">
              Create Promotion
            </Button>
          </div>
        )}
      </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl" dir="ltr">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {editingItem ? 'Edit Promotion' : 'Create Promotion'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {currentStep === 1 ? renderFormFields() : renderProductSelection()}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            {currentStep === 1 && activeTab !== 'free_shipping' ? (
              <>
                <Button onClick={handleCloseModal} variant="outline" className="rounded-xl border-gray-200">
                  Cancel
                </Button>
                <Button onClick={() => setCurrentStep(2)} className="rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white">
                  Next: Select Products
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => activeTab === 'free_shipping' ? handleCloseModal() : setCurrentStep(1)} variant="outline" className="rounded-xl border-gray-200">
                  {activeTab === 'free_shipping' ? 'Cancel' : 'Back'}
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Promotion
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-2xl border-none shadow-2xl" dir="ltr">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Delete Promotion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Are you sure you want to delete this promotion? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

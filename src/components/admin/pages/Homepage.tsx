"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout,
  Save,
  Loader2,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  GripVertical,
  Link as LinkIcon,
  Type,
  Eye,
  Upload,
  X,
  Package,
  Sparkles,
  Heart,
  Film,
  Grid3X3,
  ArrowRightLeft,
  Smartphone,
  Megaphone,
  Pencil,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { PageHeader, Card } from "@/components/admin/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Services
import { heroService, HeroSettings, DEFAULT_HERO } from "@/services/hero";
import { customerLoveService, CustomerLoveItem, CustomerLoveSettings } from "@/services/customerLove";
import { moreToDiscoverService, MoreToDiscoverItem, MoreToDiscoverSettings } from "@/services/moreToDiscover";
import { mobileHeroService, MobileHero, DEFAULT_MOBILE_HERO, FILE_LIMITS } from "@/services/mobileHero";
import { marqueeService, MarqueeItem, MarqueeSettings, DEFAULT_MARQUEE_SETTINGS } from "@/services/marquee";
import { productService } from "@/services/products";
import { socialProofsAdminService, SocialProofAdmin } from "@/services/admin/socialProofs";
import { DropboxImg } from "@/components/DropboxImage";
import { uploadFile } from "@/api/admin/upload";

type TabType = 'hero' | 'mobileHero' | 'topBanner' | 'featuresTicker' | 'customerLove' | 'moreToDiscover' | 'ourVibes';

const HomepagePage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // ===================== HERO STATE =====================
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [heroForm, setHeroForm] = useState({
    title: DEFAULT_HERO.title,
    subtitle: DEFAULT_HERO.subtitle,
    description: DEFAULT_HERO.description,
    button_text: DEFAULT_HERO.button_text,
    button_link: DEFAULT_HERO.button_link,
    image_url: DEFAULT_HERO.image_url,
  });
  const [heroSaving, setHeroSaving] = useState(false);
  const heroImageRef = useRef<HTMLInputElement>(null);

  // ===================== CUSTOMER LOVE STATE =====================
  const [customerLoveItems, setCustomerLoveItems] = useState<CustomerLoveItem[]>([]);
  const [customerLoveSettings, setCustomerLoveSettings] = useState<CustomerLoveSettings | null>(null);
  const [customerLoveSaving, setCustomerLoveSaving] = useState(false);
  const customerLoveImageRef = useRef<HTMLInputElement>(null);

  // ===================== MORE TO DISCOVER STATE =====================
  const [moreItems, setMoreItems] = useState<MoreToDiscoverItem[]>([]);
  const [moreSettings, setMoreSettings] = useState<MoreToDiscoverSettings | null>(null);
  const [moreSaving, setMoreSaving] = useState(false);
  const moreImageRef = useRef<HTMLInputElement>(null);

  // ===================== OUR VIBES (REELS) STATE =====================
  const [vibesItems, setVibesItems] = useState<SocialProofAdmin[]>([]);
  const [vibesSaving, setVibesSaving] = useState(false);
  const [products, setProducts] = useState<{ id: string; name_en: string }[]>([]);
  const [newVibe, setNewVibe] = useState({ video_url: '', thumbnail_url: '', title_en: '', product_id: '', is_featured: true });
  const vibesThumbnailRef = useRef<HTMLInputElement>(null);
  const vibesVideoRef = useRef<HTMLInputElement>(null);
  const [vibesVideoUploading, setVibesVideoUploading] = useState(false);
  const [editingVibe, setEditingVibe] = useState<SocialProofAdmin | null>(null);
  const [editVibeForm, setEditVibeForm] = useState({ video_url: '', thumbnail_url: '', title_en: '', product_id: '', is_featured: true });
  const [editVibeModalOpen, setEditVibeModalOpen] = useState(false);
  const [editVibeSaving, setEditVibeSaving] = useState(false);
  const editVibesVideoRef = useRef<HTMLInputElement>(null);
  const editVibesThumbnailRef = useRef<HTMLInputElement>(null);

  // ===================== MOBILE HERO STATE =====================
  const [mobileHero, setMobileHero] = useState<MobileHero | null>(null);
  const [mobileHeroForm, setMobileHeroForm] = useState({
    button_text: DEFAULT_MOBILE_HERO.button_text,
    button_link: DEFAULT_MOBILE_HERO.button_link,
    text_color: DEFAULT_MOBILE_HERO.text_color,
    media_url: DEFAULT_MOBILE_HERO.media_url,
    media_type: DEFAULT_MOBILE_HERO.media_type as 'image' | 'video',
  });
  const [mobileHeroSaving, setMobileHeroSaving] = useState(false);
  const mobileHeroMediaRef = useRef<HTMLInputElement>(null);

  // ===================== TOP BANNER STATE =====================
  const [topBannerItems, setTopBannerItems] = useState<MarqueeItem[]>([]);
  const [topBannerSettings, setTopBannerSettings] = useState<MarqueeSettings | null>(null);
  const [topBannerSaving, setTopBannerSaving] = useState(false);
  const [newTopBannerText, setNewTopBannerText] = useState("");

  // ===================== FEATURES TICKER STATE =====================
  const [tickerItems, setTickerItems] = useState<MarqueeItem[]>([]);
  const [tickerSettings, setTickerSettings] = useState<MarqueeSettings | null>(null);
  const [tickerSaving, setTickerSaving] = useState(false);
  const [newTickerText, setNewTickerText] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
        // Use Promise.allSettled for better error resilience
        const results = await Promise.allSettled([
            heroService.getActive(),
            mobileHeroService.getActive(),
            customerLoveService.getAllItems(),
            moreToDiscoverService.getAllItems(),
            socialProofsAdminService.getAll(),
            productService.getAll(),
            marqueeService.getAllItems('top_banner'),
            marqueeService.getSettings('top_banner'),
            marqueeService.getAllItems('features_ticker'),
            marqueeService.getSettings('features_ticker'),
        ]);

        // Helper to extract value or default
        const getValue = <T,>(result: PromiseSettledResult<T>, defaultValue: T): T => {
            if (result.status === 'fulfilled') return result.value;
            console.error('Failed to load:', result.reason);
            return defaultValue;
        };

        const heroData = getValue(results[0], { id: 'default', ...DEFAULT_HERO });
        const mobileHeroData = getValue(results[1], { id: 'default', ...DEFAULT_MOBILE_HERO });
        const customerLoveData = getValue(results[2], []);
        const moreToDiscoverData = getValue(results[3], []);
        const ourVibesData = getValue(results[4], []);
        const productsData = getValue(results[5], []);
        const topBannerItemsData = getValue(results[6], []);
        const topBannerSettingsData = getValue(results[7], null);
        const tickerItemsData = getValue(results[8], []);
        const tickerSettingsData = getValue(results[9], null);

      // Handle Hero
      const heroSettings = heroData as HeroSettings;
      if (heroSettings) {
        setHero(heroSettings);
        setHeroForm({
            title: heroSettings.title || '',
            subtitle: heroSettings.subtitle || '',
            description: heroSettings.description || '',
            button_text: heroSettings.button_text || '',
            button_link: heroSettings.button_link || '',
            image_url: heroSettings.image_url || '',
        });
      }

      // Handle Mobile Hero
      const mobileSettings = mobileHeroData as MobileHero;
      if (mobileSettings) {
        setMobileHero(mobileSettings);
        setMobileHeroForm({
            button_text: mobileSettings.button_text || '',
            button_link: mobileSettings.button_link || '',
            text_color: mobileSettings.text_color || '#ffffff',
            media_url: mobileSettings.media_url || '',
            media_type: mobileSettings.media_type || 'image',
        });
      }

      // Handle Customer Love
       setCustomerLoveItems(customerLoveData as CustomerLoveItem[]); 
       // Load settings separately with error handling
       try {
         const clSettings = await customerLoveService.getSettings();
         setCustomerLoveSettings(clSettings);
       } catch (e) {
         console.error('Failed to load customer love settings:', e);
       }

       // Handle More To Discover
       setMoreItems(moreToDiscoverData as MoreToDiscoverItem[]);
       try {
         const mtdSettings = await moreToDiscoverService.getSettings();
         setMoreSettings(mtdSettings);
       } catch (e) {
         console.error('Failed to load more to discover settings:', e);
       }

       // Handle Our Vibes (Reels - social_proofs)
       setVibesItems(ourVibesData as SocialProofAdmin[]);
       try {
         // no separate settings needed for social_proofs
       } catch (e) { console.error(e); }

       // Handle Products
       setProducts((productsData as any[]).map((p: any) => ({ id: p.id, name_en: p.name_en })));

       // Handle Top Banner
       setTopBannerItems(topBannerItemsData as MarqueeItem[]);
       setTopBannerSettings(topBannerSettingsData || {
            ...DEFAULT_MARQUEE_SETTINGS,
            type: 'top_banner',
            id: 'new-top',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
       });

       // Handle Features Ticker
       setTickerItems(tickerItemsData as MarqueeItem[]);
       setTickerSettings(tickerSettingsData || {
            ...DEFAULT_MARQUEE_SETTINGS,
            type: 'features_ticker',
            id: 'new-ticker',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
       });

    } catch (error) {
      console.error("Error loading homepage data:", error);
      toast({ title: "Error", description: "Failed to load homepage data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper for reloading specific sections if needed
  const loadHero = async () => {
    try {
      const data = await heroService.getActive();
      setHero(data);
      setHeroForm({
        title: data.title || '',
        subtitle: data.subtitle || '',
        description: data.description || '',
        button_text: data.button_text || '',
        button_link: data.button_link || '',
        image_url: data.image_url || '',
      });
    } catch (error) { console.error(error); }
  };

  const loadMobileHero = async () => {
    try {
      const data = await mobileHeroService.getActive();
      setMobileHero(data);
    } catch (error) { console.error(error); }
  };


  // ===================== UPLOAD HELPER =====================
  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      const result = await uploadFile(file, 'homepage');
      
      if (!result.success || !result.data) {
        throw new Error(result.error || "Upload failed");
      }

      return result.data.url;
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file to Supabase",
        variant: "destructive",
      });
      return null;
    }
  };

  // ===================== HERO HANDLERS =====================
  const handleHeroSave = async () => {
    setHeroSaving(true);
    try {
      await heroService.update(hero?.id || '', heroForm);
      toast({ title: "Saved", description: "Hero section updated successfully" });
      await loadHero();
    } catch (error) {
      console.error("Error saving hero:", error);
      toast({ title: "Error", description: "Failed to save hero section", variant: "destructive" });
    } finally {
      setHeroSaving(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const path = await uploadToStorage(file);
    if (path) {
      setHeroForm({ ...heroForm, image_url: path });
    }
  };

  // ===================== MOBILE HERO HANDLERS =====================
  const handleMobileHeroSave = async () => {
    setMobileHeroSaving(true);
    try {
      await mobileHeroService.update(mobileHero?.id || '', mobileHeroForm);
      toast({ title: "Saved", description: "Mobile hero updated successfully" });
      await loadMobileHero();
    } catch (error) {
      console.error("Error saving mobile hero:", error);
      toast({ title: "Error", description: "Failed to save mobile hero", variant: "destructive" });
    } finally {
      setMobileHeroSaving(false);
    }
  };

  const handleMobileHeroMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine file type
    const isVideo = file.type.startsWith('video/');
    const fileType = isVideo ? 'video' : 'image';
    
    // Validate file size
    const validation = mobileHeroService.validateFileSize(file, fileType);
    if (!validation.valid) {
      toast({ 
        title: "File Too Large", 
        description: validation.error, 
        variant: "destructive" 
      });
      return;
    }

    const path = await uploadToStorage(file);
    if (path) {
      setMobileHeroForm({ 
        ...mobileHeroForm, 
        media_url: path, 
        media_type: fileType 
      });
      toast({ 
        title: "Uploaded", 
        description: `${fileType === 'video' ? 'Video' : 'Image'} uploaded successfully` 
      });
    }
  };

  // ===================== CUSTOMER LOVE HANDLERS =====================
  const handleAddCustomerLoveImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomerLoveSaving(true);
    try {
      const path = await uploadToStorage(file);
      if (path) {
        const newItem = await customerLoveService.createItem({ image_url: path });
        setCustomerLoveItems([...customerLoveItems, newItem]);
        toast({ title: "Added", description: "Image added successfully" });
      }
    } catch (error) {
      console.error("Error adding image:", error);
      toast({ title: "Error", description: "Failed to add image", variant: "destructive" });
    } finally {
      setCustomerLoveSaving(false);
    }
  };

  const handleDeleteCustomerLoveItem = async (id: string) => {
    try {
      await customerLoveService.deleteItem(id);
      setCustomerLoveItems(customerLoveItems.filter(item => item.id !== id));
      toast({ title: "Deleted", description: "Image removed" });
    } catch (error) {
      console.error("Error deleting:", error);
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  // ===================== MORE TO DISCOVER HANDLERS =====================
  const handleAddMoreImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMoreSaving(true);
    try {
      const path = await uploadToStorage(file);
      if (path) {
        const newItem = await moreToDiscoverService.createItem({ image_url: path });
        setMoreItems([...moreItems, newItem]);
        toast({ title: "Added", description: "Image added successfully" });
      }
    } catch (error) {
      console.error("Error adding image:", error);
      toast({ title: "Error", description: "Failed to add image", variant: "destructive" });
    } finally {
      setMoreSaving(false);
    }
  };

  const handleDeleteMoreItem = async (id: string) => {
    try {
      await moreToDiscoverService.deleteItem(id);
      setMoreItems(moreItems.filter(item => item.id !== id));
      toast({ title: "Deleted", description: "Image removed" });
    } catch (error) {
      console.error("Error deleting:", error);
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  // ===================== OUR VIBES (REELS) HANDLERS =====================
  const handleVibesVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVibesVideoUploading(true);
    try {
      const path = await uploadToStorage(file);
      if (path) {
        setNewVibe({ ...newVibe, video_url: path });
        toast({ title: "Uploaded", description: "Video uploaded successfully" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to upload video", variant: "destructive" });
    } finally {
      setVibesVideoUploading(false);
    }
  };

  const handleVibesThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = await uploadToStorage(file);
    if (path) setNewVibe({ ...newVibe, thumbnail_url: path });
  };

  const handleAddVibe = async () => {
    if (!newVibe.video_url) {
      toast({ title: "Error", description: "Video URL is required", variant: "destructive" });
      return;
    }
    setVibesSaving(true);
    try {
      const item = await socialProofsAdminService.create({
        video_url: newVibe.video_url,
        title_en: newVibe.title_en || undefined,
        thumbnail_url: newVibe.thumbnail_url || undefined,
        product_id: newVibe.product_id || undefined,
        is_featured: newVibe.is_featured,
      });
      setVibesItems([item, ...vibesItems]);
      setNewVibe({ video_url: '', thumbnail_url: '', title_en: '', product_id: '', is_featured: true });
      toast({ title: "Added", description: "Reel added successfully" });
    } catch (error) {
      console.error("Error adding reel:", error);
      toast({ title: "Error", description: "Failed to add reel", variant: "destructive" });
    } finally {
      setVibesSaving(false);
    }
  };

  const handleDeleteVibe = async (id: string) => {
    try {
      await socialProofsAdminService.delete(id);
      setVibesItems(vibesItems.filter(item => item.id !== id));
      toast({ title: "Deleted", description: "Reel removed" });
    } catch (error) {
      console.error("Error deleting:", error);
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleToggleFeatured = async (item: SocialProofAdmin) => {
    try {
      await socialProofsAdminService.update(item.id, { is_featured: !item.is_featured });
      setVibesItems(vibesItems.map(v => v.id === item.id ? { ...v, is_featured: !v.is_featured } : v));
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const handleMoveReel = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= vibesItems.length) return;

    const newItems = [...vibesItems];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(newIndex, 0, moved);
    setVibesItems(newItems);

    try {
      await socialProofsAdminService.reorder(newItems.map(item => item.id));
    } catch (error) {
      // Revert on error
      setVibesItems(vibesItems);
      toast({ title: "Error", description: "Failed to reorder", variant: "destructive" });
    }
  };

  // ===================== EDIT VIBE HANDLERS =====================
  const openEditVibeModal = (item: SocialProofAdmin) => {
    setEditingVibe(item);
    setEditVibeForm({
      video_url: item.video_url,
      thumbnail_url: item.thumbnail_url || '',
      title_en: item.title_en || '',
      product_id: item.product_id || '',
      is_featured: item.is_featured,
    });
    setEditVibeModalOpen(true);
  };

  const handleEditVibeVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditVibeSaving(true);
    try {
      const res = await uploadFile(file, 'reels');
      if (res.success && res.data) {
        setEditVibeForm({ ...editVibeForm, video_url: res.data.url });
      } else {
        toast({ title: "Error", description: res.error || "Upload failed", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" });
    } finally {
      setEditVibeSaving(false);
    }
  };

  const handleEditVibeThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = await uploadToStorage(file);
    if (path) setEditVibeForm({ ...editVibeForm, thumbnail_url: path });
  };

  const handleSaveEditVibe = async () => {
    if (!editingVibe || !editVibeForm.video_url) return;
    setEditVibeSaving(true);
    try {
      await socialProofsAdminService.update(editingVibe.id, {
        video_url: editVibeForm.video_url,
        thumbnail_url: editVibeForm.thumbnail_url || undefined,
        title_en: editVibeForm.title_en || undefined,
        product_id: editVibeForm.product_id || null,
        is_featured: editVibeForm.is_featured,
      });
      setVibesItems(vibesItems.map(v => v.id === editingVibe.id ? {
        ...v,
        video_url: editVibeForm.video_url,
        thumbnail_url: editVibeForm.thumbnail_url || undefined,
        title_en: editVibeForm.title_en || undefined,
        product_id: editVibeForm.product_id || undefined,
        is_featured: editVibeForm.is_featured,
      } : v));
      setEditVibeModalOpen(false);
      setEditingVibe(null);
      toast({ title: "Updated", description: "Reel updated successfully" });
    } catch (error) {
      console.error("Error updating reel:", error);
      toast({ title: "Error", description: "Failed to update reel", variant: "destructive" });
    } finally {
      setEditVibeSaving(false);
    }
  };

  // ===================== TOP BANNER HANDLERS =====================
  const handleTopBannerSave = async () => {
    setTopBannerSaving(true);
    try {
      if (topBannerSettings) {
        await marqueeService.updateSettings({
          background_color: topBannerSettings.background_color,
          text_color: topBannerSettings.text_color,
          scroll_speed: topBannerSettings.scroll_speed,
          is_active: topBannerSettings.is_active,
          type: 'top_banner'
        }, 'top_banner');
        toast({ title: "Saved", description: "Top Banner settings updated successfully" });
      }
    } catch (error) {
      console.error("Error saving top banner settings:", error);
      toast({ title: "Error", description: "Failed to save top banner settings", variant: "destructive" });
    } finally {
      setTopBannerSaving(false);
    }
  };

  const handleAddTopBannerItem = async () => {
    if (!newTopBannerText.trim()) return;
    setTopBannerSaving(true);
    try {
      const newItem = await marqueeService.createItem(newTopBannerText, 'top_banner');
      setTopBannerItems([...topBannerItems, newItem]);
      setNewTopBannerText("");
      toast({ title: "Added", description: "Banner item added successfully" });
    } catch (error) {
      console.error("Error adding banner item:", error);
      toast({ title: "Error", description: "Failed to add banner item", variant: "destructive" });
    } finally {
      setTopBannerSaving(false);
    }
  };

  const handleDeleteTopBannerItem = async (id: string) => {
    try {
      await marqueeService.deleteItem(id);
      setTopBannerItems(topBannerItems.filter((item) => item.id !== id));
      toast({ title: "Deleted", description: "Banner item removed" });
    } catch (error) {
      console.error("Error deleting banner item:", error);
      toast({ title: "Error", description: "Failed to delete banner item", variant: "destructive" });
    }
  };

  // ===================== FEATURES TICKER HANDLERS =====================
  const handleTickerSave = async () => {
    setTickerSaving(true);
    try {
      if (tickerSettings) {
        await marqueeService.updateSettings({
          background_color: tickerSettings.background_color,
          text_color: tickerSettings.text_color,
          scroll_speed: tickerSettings.scroll_speed,
          is_active: tickerSettings.is_active,
          type: 'features_ticker'
        }, 'features_ticker');
        toast({ title: "Saved", description: "Features ticker settings updated successfully" });
      }
    } catch (error) {
      console.error("Error saving ticker settings:", error);
      toast({ title: "Error", description: "Failed to save ticker settings", variant: "destructive" });
    } finally {
      setTickerSaving(false);
    }
  };

  const handleAddTickerItem = async () => {
    if (!newTickerText.trim()) return;
    setTickerSaving(true);
    try {
      const newItem = await marqueeService.createItem(newTickerText, 'features_ticker');
      setTickerItems([...tickerItems, newItem]);
      setNewTickerText("");
      toast({ title: "Added", description: "Ticker item added successfully" });
    } catch (error) {
      console.error("Error adding ticker item:", error);
      toast({ title: "Error", description: "Failed to add ticker item", variant: "destructive" });
    } finally {
      setTickerSaving(false);
    }
  };

  const handleDeleteTickerItem = async (id: string) => {
    try {
      await marqueeService.deleteItem(id);
      setTickerItems(tickerItems.filter((item) => item.id !== id));
      toast({ title: "Deleted", description: "Ticker item removed" });
    } catch (error) {
      console.error("Error deleting ticker item:", error);
      toast({ title: "Error", description: "Failed to delete ticker item", variant: "destructive" });
    }
  };


  const tabs = [
    { id: 'hero' as TabType, label: 'Hero Section', icon: Layout },
    { id: 'mobileHero' as TabType, label: 'Mobile Hero', icon: Smartphone },
    { id: 'topBanner' as TabType, label: 'Top Banner', icon: Megaphone },
    { id: 'featuresTicker' as TabType, label: 'Features Ticker', icon: ArrowRightLeft },
    { id: 'customerLove' as TabType, label: 'Customer Love', icon: Heart },
    { id: 'moreToDiscover' as TabType, label: 'More to Discover', icon: Grid3X3 },
    { id: 'ourVibes' as TabType, label: 'Reels', icon: Film },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Layout}
          title="Homepage Sections"
          subtitle="Manage all homepage content"
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Layout}
        title="Homepage Sections"
        subtitle="Manage Hero, Customer Love, More to Discover, and Reels sections"
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap shadow-sm ${
              activeTab === tab.id
                ? 'bg-primary text-white ring-1 ring-primary/20'
                : 'bg-white border border-gray-100 text-gray-600 hover:border-primary hover:text-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===================== HERO TAB ===================== */}
      {activeTab === 'hero' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Left: Preview */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="flex">
                <div className="w-1/2 p-4">
                  <h2 className="font-sans font-bold text-xl font-bold mb-2">{heroForm.title}</h2>
                  <p className="text-xs text-gray-600 mb-2 italic">{heroForm.subtitle}</p>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-3">{heroForm.description}</p>
                  <button className="px-3 py-1.5 bg-[hsl(var(--luxury-charcoal))] text-white text-xs rounded-lg">
                    {heroForm.button_text}
                  </button>
                </div>
                <div className="w-1/2 h-48 relative bg-gray-200">
                  {heroForm.image_url && (
                    heroForm.image_url.startsWith('/') && !heroForm.image_url.startsWith('/hero') ? (
                      <DropboxImg src={heroForm.image_url} alt="Hero" className="w-full h-full object-cover" />
                    ) : (
                      <img src={heroForm.image_url} alt="Hero" className="w-full h-full object-cover" />
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Right: Settings */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
                <Input
                  value={heroForm.title}
                  onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Subtitle</label>
                <Input
                  value={heroForm.subtitle}
                  onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <textarea
                  value={heroForm.description}
                  onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm"
                  rows={3}
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Button Text</label>
                  <Input
                    value={heroForm.button_text}
                    onChange={(e) => setHeroForm({ ...heroForm, button_text: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Button Link</label>
                  <Input
                    value={heroForm.button_link}
                    onChange={(e) => setHeroForm({ ...heroForm, button_link: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Image</label>
                <div className="flex gap-2">
                  <Input
                    value={heroForm.image_url}
                    onChange={(e) => setHeroForm({ ...heroForm, image_url: e.target.value })}
                    placeholder="Dropbox path or URL"
                    dir="ltr"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => heroImageRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <input
                    ref={heroImageRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
              <Button
                onClick={handleHeroSave}
                disabled={heroSaving}
                className="w-full rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white"
              >
                {heroSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Hero Section
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ===================== MOBILE HERO TAB ===================== */}
      {activeTab === 'mobileHero' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Left: Preview */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview (Mobile)
            </h3>
            <div className="bg-[hsl(var(--luxury-charcoal))] rounded-2xl overflow-hidden mx-auto shadow-2xl border-4 border-white" style={{ width: '200px', height: '400px' }}>
              <div className="relative w-full h-full">
                {mobileHeroForm.media_url && (
                  mobileHeroForm.media_type === 'video' ? (
                    <video
                      src={mobileHeroForm.media_url.startsWith('/') ? undefined : mobileHeroForm.media_url}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                    />
                  ) : mobileHeroForm.media_url.startsWith('/') && !mobileHeroForm.media_url.startsWith('/hero') ? (
                    <DropboxImg src={mobileHeroForm.media_url} alt="Mobile Hero" className="w-full h-full object-cover" />
                  ) : (
                    <img src={mobileHeroForm.media_url} alt="Mobile Hero" className="w-full h-full object-cover" />
                  )
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <button 
                    className="px-6 py-2 border-2 text-sm font-medium tracking-widest"
                    style={{ 
                      color: mobileHeroForm.text_color, 
                      borderColor: mobileHeroForm.text_color 
                    }}
                  >
                    {mobileHeroForm.button_text}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Right: Settings */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile Hero Settings
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Button Text</label>
                  <Input
                    value={mobileHeroForm.button_text}
                    onChange={(e) => setMobileHeroForm({ ...mobileHeroForm, button_text: e.target.value })}
                    placeholder="SHOP BAGS"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Button Link</label>
                  <Input
                    value={mobileHeroForm.button_link}
                    onChange={(e) => setMobileHeroForm({ ...mobileHeroForm, button_link: e.target.value })}
                    placeholder="/products"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Text Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={mobileHeroForm.text_color}
                    onChange={(e) => setMobileHeroForm({ ...mobileHeroForm, text_color: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={mobileHeroForm.text_color}
                    onChange={(e) => setMobileHeroForm({ ...mobileHeroForm, text_color: e.target.value })}
                    placeholder="#ffffff"
                    dir="ltr"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Media (Image: max 2MB, Video: max 5MB)
                </label>
                <div className="flex gap-2">
                  <Input
                    value={mobileHeroForm.media_url}
                    onChange={(e) => setMobileHeroForm({ ...mobileHeroForm, media_url: e.target.value })}
                    placeholder="Upload image or video"
                    dir="ltr"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => mobileHeroMediaRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <input
                    ref={mobileHeroMediaRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMobileHeroMediaUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <Button
                onClick={handleMobileHeroSave}
                disabled={mobileHeroSaving}
                className="w-full rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white"
              >
                {mobileHeroSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Mobile Hero
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ===================== TOP BANNER TAB ===================== */}
      {activeTab === 'topBanner' && (
        !topBannerSettings ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Left: Preview */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </h3>
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div 
                  className="py-3 px-4 flex items-center justify-center relative overflow-hidden"
                  style={{ 
                    backgroundColor: topBannerSettings.background_color || '#000000',
                    color: topBannerSettings.text_color || '#ffffff'
                  }}
                >
                  <div className="whitespace-nowrap font-medium text-sm tracking-widest uppercase">
                    {topBannerSettings.is_active ? (
                      topBannerItems.length > 0 ? (
                         topBannerItems.map((item, i) => (
                           <span key={item.id} className="mx-8">{item.text}</span>
                         ))
                      ) : (
                        "ADD ANNOUNCEMENTS TO SEE PREVIEW"
                      )
                    ) : (
                      "BANNER IS INACTIVE"
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    This is how the banner will appear on your store.
                  </p>
                </div>
              </div>

              {/* Items Management */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Megaphone className="w-4 h-4" />
                  Announcements
                </h3>
                
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter announcement text..."
                    value={newTopBannerText}
                    onChange={(e) => setNewTopBannerText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTopBannerItem()}
                    dir="ltr"
                  />
                  <Button 
                    onClick={handleAddTopBannerItem}
                    disabled={!newTopBannerText.trim() || topBannerSaving}
                    size="icon"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {topBannerItems.map((item, index) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg group hover:border-gray-400 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs font-mono text-gray-500">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm">{item.text}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTopBannerItem(item.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {topBannerItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                      <p className="text-sm">No announcements yet</p>
                      <p className="text-xs mt-1">Add your first announcement above</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Right: Settings */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Appearance
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-900 block">Active Status</label>
                    <p className="text-xs text-gray-500">Enable or disable the banner</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={topBannerSettings.is_active}
                      onChange={(e) => setTopBannerSettings({
                        ...topBannerSettings,
                        is_active: e.target.checked
                      })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Background Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={topBannerSettings.background_color || '#000000'}
                      onChange={(e) => setTopBannerSettings({ ...topBannerSettings, background_color: e.target.value })}
                      className="w-12 h-12 rounded-lg border cursor-pointer p-1"
                    />
                    <Input
                      value={topBannerSettings.background_color || ''}
                      onChange={(e) => setTopBannerSettings({ ...topBannerSettings, background_color: e.target.value })}
                      placeholder="#000000"
                      dir="ltr"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Text Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={topBannerSettings.text_color || '#ffffff'}
                      onChange={(e) => setTopBannerSettings({ ...topBannerSettings, text_color: e.target.value })}
                      className="w-12 h-12 rounded-lg border cursor-pointer p-1"
                    />
                    <Input
                      value={topBannerSettings.text_color || ''}
                      onChange={(e) => setTopBannerSettings({ ...topBannerSettings, text_color: e.target.value })}
                      placeholder="#ffffff"
                      dir="ltr"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleTopBannerSave}
                    disabled={topBannerSaving}
                    className="w-full rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white"
                  >
                    {topBannerSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      )}

      {/* ===================== FEATURES TICKER TAB ===================== */}
      {activeTab === 'featuresTicker' && (
        !tickerSettings ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Left: Preview */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </h3>
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div 
                  className="py-3 px-4 flex items-center overflow-hidden"
                  style={{ 
                    backgroundColor: tickerSettings.background_color || '#000000',
                    color: tickerSettings.text_color || '#ffffff'
                  }}
                >
                  <div className="whitespace-nowrap font-medium text-sm tracking-[0.3em] uppercase flex">
                    {tickerSettings.is_active ? (
                      tickerItems.length > 0 ? (
                         <>
                           {tickerItems.map((item, i) => (
                             <div key={item.id} className="flex items-center">
                               <span className="px-12">{item.text}</span>
                               <span className="opacity-30 text-xs">•</span>
                             </div>
                           ))}
                           {/* Duplicate for visual effect in preview */}
                           {tickerItems.map((item, i) => (
                             <div key={`dup-${item.id}`} className="flex items-center opacity-50">
                               <span className="px-12">{item.text}</span>
                               <span className="opacity-30 text-xs">•</span>
                             </div>
                           ))}
                         </>
                      ) : (
                        "ADD FEATURES TO SEE PREVIEW"
                      )
                    ) : (
                      "TICKER IS INACTIVE"
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    This is how the ticker will appear on your homepage.
                  </p>
                </div>
              </div>

              {/* Items Management */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Ticker Features
                </h3>
                
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter feature text (e.g. 100% HANDMADE)..."
                    value={newTickerText}
                    onChange={(e) => setNewTickerText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTickerItem()}
                    dir="ltr"
                  />
                  <Button 
                    onClick={handleAddTickerItem}
                    disabled={!newTickerText.trim() || tickerSaving}
                    size="icon"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {tickerItems.map((item, index) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg group hover:border-gray-400 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs font-mono text-gray-500">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm">{item.text}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTickerItem(item.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {tickerItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                      <p className="text-sm">No ticker items yet</p>
                      <p className="text-xs mt-1">Add your first feature above</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Right: Settings */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Appearance
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-900 block">Active Status</label>
                    <p className="text-xs text-gray-500">Enable or disable the ticker</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={tickerSettings.is_active}
                      onChange={(e) => setTickerSettings({
                        ...tickerSettings,
                        is_active: e.target.checked
                      })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Background Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={tickerSettings.background_color || '#000000'}
                      onChange={(e) => setTickerSettings({ ...tickerSettings, background_color: e.target.value })}
                      className="w-12 h-12 rounded-lg border cursor-pointer p-1"
                    />
                    <Input
                      value={tickerSettings.background_color || ''}
                      onChange={(e) => setTickerSettings({ ...tickerSettings, background_color: e.target.value })}
                      placeholder="#000000"
                      dir="ltr"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Text Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={tickerSettings.text_color || '#ffffff'}
                      onChange={(e) => setTickerSettings({ ...tickerSettings, text_color: e.target.value })}
                      className="w-12 h-12 rounded-lg border cursor-pointer p-1"
                    />
                    <Input
                      value={tickerSettings.text_color || ''}
                      onChange={(e) => setTickerSettings({ ...tickerSettings, text_color: e.target.value })}
                      placeholder="#ffffff"
                      dir="ltr"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleTickerSave}
                    disabled={tickerSaving}
                    className="w-full rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white"
                  >
                    {tickerSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      )}

      {/* ===================== CUSTOMER LOVE TAB ===================== */}
      {activeTab === 'customerLove' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                Customer Love Images ({customerLoveItems.length}/8)
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => customerLoveImageRef.current?.click()}
                disabled={customerLoveSaving || customerLoveItems.length >= 8}
              >
                {customerLoveSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {customerLoveItems.length >= 8 ? 'Max 8 Images' : 'Add Image'}
              </Button>
              <input
                ref={customerLoveImageRef}
                type="file"
                accept="image/*"
                onChange={handleAddCustomerLoveImage}
                className="hidden"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {customerLoveItems.map((item) => (
                <div key={item.id} className="relative group aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                  {item.image_url.startsWith('/') ? (
                    <DropboxImg src={item.image_url} alt="Customer" className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.image_url} alt="Customer" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => handleDeleteCustomerLoveItem(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            {customerLoveItems.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No images yet. Add some customer photos!</p>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* ===================== MORE TO DISCOVER TAB ===================== */}
      {activeTab === 'moreToDiscover' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-blue-500" />
                More to Discover Images ({moreItems.length}/2)
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moreImageRef.current?.click()}
                disabled={moreSaving || moreItems.length >= 2}
              >
                {moreSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {moreItems.length >= 2 ? 'Max 2 Images' : 'Add Image'}
              </Button>
              <input
                ref={moreImageRef}
                type="file"
                accept="image/*"
                onChange={handleAddMoreImage}
                className="hidden"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {moreItems.map((item) => (
                <div key={item.id} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {item.image_url.startsWith('/') ? (
                    <DropboxImg src={item.image_url} alt="Discover" className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.image_url} alt="Discover" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => handleDeleteMoreItem(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            {moreItems.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No images yet. Add some discover images!</p>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* ===================== OUR VIBES TAB ===================== */}
      {activeTab === 'ourVibes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Add New Reel */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Reel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Video (Required)</label>
                <div className="space-y-2">
                  {/* Upload button */}
                  <div
                    onClick={() => vibesVideoRef.current?.click()}
                    className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      newVibe.video_url
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30"
                    }`}
                  >
                    {vibesVideoUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        <p className="text-xs text-gray-500">Uploading...</p>
                      </>
                    ) : newVibe.video_url ? (
                      <>
                        <Video className="w-6 h-6 text-green-600" />
                        <p className="text-xs text-green-700 font-medium">Video uploaded ✓</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[180px]">{newVibe.video_url.split('/').pop()}</p>
                      </>
                    ) : (
                      <>
                        <Video className="w-6 h-6 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium">Click to upload video</p>
                        <p className="text-[10px] text-gray-400">MP4, MOV, WebM</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={vibesVideoRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVibesVideoUpload}
                    className="hidden"
                  />
                  {newVibe.video_url && (
                    <button
                      type="button"
                      onClick={() => setNewVibe({ ...newVibe, video_url: '' })}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove video
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Thumbnail (Optional)</label>
                <div className="flex gap-2">
                  <Input
                    value={newVibe.thumbnail_url}
                    onChange={(e) => setNewVibe({ ...newVibe, thumbnail_url: e.target.value })}
                    placeholder="Thumbnail image URL"
                    dir="ltr"
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={() => vibesThumbnailRef.current?.click()}>
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <input
                    ref={vibesThumbnailRef}
                    type="file"
                    accept="image/*"
                    onChange={handleVibesThumbnailUpload}
                    className="hidden"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Title (Optional)</label>
                <Input
                  value={newVibe.title_en}
                  onChange={(e) => setNewVibe({ ...newVibe, title_en: e.target.value })}
                  placeholder="Reel title..."
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Link to Product (Optional)</label>
                <Select
                  value={newVibe.product_id || "none"}
                  onValueChange={(value) => setNewVibe({ ...newVibe, product_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger className="w-full rounded-xl border-gray-200">
                    <SelectValue placeholder="No product link" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No product link</SelectItem>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={newVibe.is_featured}
                    onChange={(e) => setNewVibe({ ...newVibe, is_featured: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">Show on homepage (Featured)</span>
              </div>
            </div>
            <Button
              onClick={handleAddVibe}
              disabled={vibesSaving || !newVibe.video_url}
              className="mt-4 rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white"
            >
              {vibesSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Reel
            </Button>
          </Card>

          {/* Existing Reels */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Film className="w-4 h-4 text-primary" />
              Reels ({vibesItems.length})
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vibesItems.map((item, index) => (
                <div key={item.id} className="relative group bg-gray-100 rounded-lg overflow-hidden">
                  <div className="aspect-[9/16] bg-gray-200 relative">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title_en || "Reel"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {/* Featured badge */}
                    <div
                      onClick={() => handleToggleFeatured(item)}
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        item.is_featured ? "bg-primary text-white shadow-sm" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {item.is_featured ? "Featured" : "Hidden"}
                    </div>
                    {/* Order number */}
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{item.title_en || item.video_url}</p>
                    {item.product && (
                      <p className="text-xs text-primary truncate flex items-center gap-1 mt-1">
                        <Package className="w-3 h-3" />
                        {item.product.name_en}
                      </p>
                    )}
                  </div>
                  {/* Reorder buttons */}
                  <div className="absolute bottom-12 right-2 flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveReel(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 bg-white text-gray-700 rounded-full shadow-sm disabled:opacity-30 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveReel(index, 'down')}
                      disabled={index === vibesItems.length - 1}
                      className="p-1.5 bg-white text-gray-700 rounded-full shadow-sm disabled:opacity-30 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteVibe(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => openEditVibeModal(item)}
                    className="absolute top-10 right-2 p-1.5 bg-white text-gray-700 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {vibesItems.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No reels yet. Add some videos!</p>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Edit Reel Modal */}
      <Dialog open={editVibeModalOpen} onOpenChange={setEditVibeModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[24px]" dir="ltr">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-gray-100">
            <DialogTitle className="text-lg font-bold text-gray-900">Edit Reel</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Video */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Video</label>
              <div className="flex gap-2">
                <Input
                  value={editVibeForm.video_url}
                  onChange={(e) => setEditVibeForm({ ...editVibeForm, video_url: e.target.value })}
                  placeholder="Video URL or upload..."
                  className="flex-1 rounded-xl border-gray-200"
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-xl shrink-0"
                  onClick={() => editVibesVideoRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <input
                  ref={editVibesVideoRef}
                  type="file"
                  accept="video/*"
                  onChange={handleEditVibeVideoUpload}
                  className="hidden"
                />
              </div>
              {editVibeForm.video_url && (
                <div className="mt-2 rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[200px]">
                  <video src={editVibeForm.video_url} className="w-full h-full object-contain" controls muted />
                </div>
              )}
            </div>

            {/* Thumbnail */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Thumbnail (Optional)</label>
              <div className="flex gap-2">
                <Input
                  value={editVibeForm.thumbnail_url}
                  onChange={(e) => setEditVibeForm({ ...editVibeForm, thumbnail_url: e.target.value })}
                  placeholder="Thumbnail URL..."
                  className="flex-1 rounded-xl border-gray-200"
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-xl shrink-0"
                  onClick={() => editVibesThumbnailRef.current?.click()}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <input
                  ref={editVibesThumbnailRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditVibeThumbnailUpload}
                  className="hidden"
                />
              </div>
              {editVibeForm.thumbnail_url && (
                <div className="mt-2 rounded-xl overflow-hidden bg-gray-100 h-24 w-16">
                  <img src={editVibeForm.thumbnail_url} className="w-full h-full object-cover" alt="thumbnail" />
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title (Optional)</label>
              <Input
                value={editVibeForm.title_en}
                onChange={(e) => setEditVibeForm({ ...editVibeForm, title_en: e.target.value })}
                placeholder="Reel title..."
                className="rounded-xl border-gray-200"
                dir="ltr"
              />
            </div>

            {/* Product Link */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Link to Product (Optional)</label>
              <Select
                value={editVibeForm.product_id || "none"}
                onValueChange={(value) => setEditVibeForm({ ...editVibeForm, product_id: value === "none" ? "" : value })}
              >
                <SelectTrigger className="w-full rounded-xl border-gray-200">
                  <SelectValue placeholder="No product link" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No product link</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={editVibeForm.is_featured}
                  onChange={(e) => setEditVibeForm({ ...editVibeForm, is_featured: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">Show on homepage (Featured)</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setEditVibeModalOpen(false)}
              className="flex-1 h-11 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditVibe}
              disabled={editVibeSaving || !editVibeForm.video_url}
              className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md"
            >
              {editVibeSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomepagePage;

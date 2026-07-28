"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Palette, Loader2, Save, Search } from "lucide-react";
import { toast } from "sonner";
 
import { PageHeader } from "@/components/admin/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

import { colorService, Color } from "@/services/colors";

const ColorsPage = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [filteredColors, setFilteredColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [hexCode, setHexCode] = useState("#000000");

  useEffect(() => {
    fetchColors();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, colors]);

  const fetchColors = async () => {
    try {
      setIsLoading(true);
      const data = await colorService.getAll();
      setColors(data);
      setFilteredColors(data);
    } catch (error) {
      console.error("Error fetching colors:", error);
      toast.error("Failed to fetch colors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredColors(colors);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = colors.filter(
      (color) =>
        color.name_en.toLowerCase().includes(query) ||
        (color.name_ar && color.name_ar.toLowerCase().includes(query)) ||
        color.hex_code.toLowerCase().includes(query)
    );
    setFilteredColors(results);
  };

  const handleOpenModal = (color?: Color) => {
    if (color) {
      setEditingColor(color);
      setNameEn(color.name_en);
      setNameAr(color.name_ar || "");
      setHexCode(color.hex_code);
    } else {
      setEditingColor(null);
      setNameEn("");
      setNameAr("");
      setHexCode("#000000");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingColor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameAr) {
      toast.error("Please fill in both English and Arabic names");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingColor) {
        await colorService.update(editingColor.id, { name_en: nameEn, name_ar: nameAr, hex_code: hexCode });
        toast.success("Color updated successfully");
      } else {
        await colorService.create({ name_en: nameEn, name_ar: nameAr, hex_code: hexCode });
        toast.success("Color added successfully");
      }
      fetchColors();
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to save color");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await colorService.delete(deleteId);
      toast.success("Color deleted successfully");
      fetchColors();
    } catch (error) {
      toast.error("Failed to delete color");
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
        icon={Palette}
        title="Manage Colors"
        subtitle={`${filteredColors.length} Available Color - Search`}
        actions={
          <div className="flex gap-3 items-center">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search for color..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 w-64 h-11 rounded-xl border-gray-200 focus:border-[hsl(var(--luxury-charcoal))]"
              />
            </div>
            <Button onClick={() => handleOpenModal()} className="h-11 rounded-xl px-4 bg-[hsl(var(--luxury-charcoal))] hover:bg-[hsl(var(--luxury-gold))] text-white gap-2 transition-all">
              <Plus size={18} />
              New Color
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredColors.map((color) => (
          <div key={color.id} className="bg-white rounded-2xl p-4 shadow-sm border border-transparent hover:border-[hsl(var(--luxury-cream))] hover:shadow-md transition-all group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full border-2 border-gray-100 shadow-inner"
                style={{ backgroundColor: color.hex_code }}
              />
              <div>
                <h3 className="font-bold text-[hsl(var(--luxury-charcoal))] font-luxury">{color.name_ar}</h3>
                <p className="text-sm text-gray-600">{color.name_en}</p>
                <p className="text-xs text-gray-400 font-mono">{color.hex_code}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => handleOpenModal(color)} className="rounded-xl">
                <Pencil size={18} className="text-gray-400 hover:text-gray-900" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteId(color.id)} className="rounded-xl">
                <Trash2 size={18} className="text-gray-400 hover:text-red-600" />
              </Button>
            </div>
          </div>
        ))}
        
        {filteredColors.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No results</h3>
            <p className="text-gray-500 text-sm">Try searching with other words</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-[32px] border-none shadow-2xl" dir="ltr">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-luxury font-bold text-[hsl(var(--luxury-charcoal))]">Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Are you sure you want to delete this color? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600 h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-xl bg-red-600 hover:bg-red-700 text-white h-11">Delete Color</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="bg-white rounded-[32px] border-none shadow-2xl overflow-hidden max-w-md p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{editingColor ? 'Edit Color' : 'Add New Color'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-luxury font-bold text-[hsl(var(--luxury-charcoal))]">
                {editingColor ? 'Edit Color' : 'Add New Color'}
              </h2>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-2">
                <Label className="text-gray-600">English Name</Label>
                <Input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="e.g. Red" required className="h-11 rounded-xl border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">Arabic Name</Label>
                <Input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="مثال: أحمر" required className="h-11 rounded-xl border-gray-200" dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">Hex Code</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={hexCode} onChange={e => setHexCode(e.target.value)} className="w-11 h-11 rounded border cursor-pointer p-0" />
                  <Input value={hexCode} onChange={e => setHexCode(e.target.value)} required className="h-11 rounded-xl border-gray-200 flex-1 uppercase font-mono" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-[32px]">
              <Button type="button" variant="outline" onClick={handleCloseModal} className="h-11 rounded-xl border-gray-200 hover:bg-white px-6">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="h-11 rounded-xl bg-[hsl(var(--luxury-charcoal))] hover:bg-[hsl(var(--luxury-gold))] text-white px-8 transition-colors">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingColor ? 'Save Changes' : 'Add Color')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ColorsPage;

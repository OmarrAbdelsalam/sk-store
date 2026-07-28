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
  const [hexCode, setHexCode] = useState("#000000");

  useEffect(() => {
    fetchColors();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, colors]);

  const fetchColors = async () => {
    try {
      console.log("Fetching colors...");
      setIsLoading(true);
      const data = await colorService.getAll();
      console.log("Colors fetched:", data);
      setColors(data);
      setFilteredColors(data);
    } catch (error) {
      console.error("Error fetching colors:", error);
      toast.error("فشل في تحميل Colors");
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
        color.name_ar?.toLowerCase().includes(query) ||
        color.hex_code.toLowerCase().includes(query)
    );
    setFilteredColors(results);
  };

  const handleOpenModal = (color?: Color) => {
    if (color) {
      setEditingColor(color);
      setNameEn(color.name_en);
      setHexCode(color.hex_code);
    } else {
      setEditingColor(null);
      setNameEn("");
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
    toast.error("لا يمكن إضافة أو Edit Colors - جميع Colors محددة مسبقاً في المكتبة");
    handleCloseModal();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    toast.error("لا يمكن Delete Colors - جميع Colors محددة مسبقاً في المكتبة");
    setDeleteId(null);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Palette}
        title="إدارة Colors"
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
            <AlertDialogTitle className="text-xl font-luxury font-bold text-[hsl(var(--luxury-charcoal))]">Alert</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              لا يمكن Delete Colors - جميع Colors محددة مسبقاً في المكتبة
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600 h-11">OK</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ColorsPage;

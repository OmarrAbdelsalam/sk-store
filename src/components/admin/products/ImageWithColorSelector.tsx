import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Color } from "@/api/admin/colors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImageWithColorSelectorProps {
  imageUrl: string;
  imageId?: string;
  colorId?: string;
  isMain?: boolean;
  isNew?: boolean;
  availableColors: Color[];
  onColorChange: (colorId: string) => void;
  onDelete: () => void;
}

export const ImageWithColorSelector = ({
  imageUrl,
  imageId,
  colorId,
  isMain,
  isNew,
  availableColors,
  onColorChange,
  onDelete,
}: ImageWithColorSelectorProps) => {
  const selectedColor = availableColors.find(c => c.id === colorId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group"
    >
      {/* Image Container */}
      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#ff6b4a] transition-colors">
        <img
          src={imageUrl}
          alt="Product"
          className="w-full h-40 object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isMain && (
            <span className="bg-[#ff6b4a] text-white text-xs px-2 py-1 rounded-md shadow-sm">
              Main
            </span>
          )}
          {isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-md shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
        >
          <X size={16} />
        </button>

        {/* Color Indicator Overlay */}
        {selectedColor && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: selectedColor.hex_code }}
              />
              <span className="text-white text-xs font-medium">
                {selectedColor.name_ar}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Color Selector - Shadcn Select */}
      <div className="mt-3">
        <Select value={colorId || ''} onValueChange={onColorChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Color">
              {selectedColor && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: selectedColor.hex_code }}
                  />
                  <span>{selectedColor.name_ar}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableColors.map(color => (
              <SelectItem key={color.id} value={color.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex_code }}
                  />
                  <span>{color.name_ar}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};

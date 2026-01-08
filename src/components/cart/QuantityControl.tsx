"use client";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { memo } from "react";

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disableIncrease?: boolean;
}

const QuantityControl = memo(({ quantity, onIncrease, onDecrease, disableIncrease }: QuantityControlProps) => {
  return (
    <div className="inline-flex items-center bg-secondary/50 rounded-full p-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onDecrease}
        aria-label="تقليل الكمية"
        className="h-8 w-8 rounded-full hover:bg-background hover:shadow-sm 
          active:scale-90 transition-all duration-200"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="text-base font-semibold min-w-[2.5rem] text-center tabular-nums 
        select-none transition-all duration-200">
        {quantity}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onIncrease}
        disabled={disableIncrease}
        aria-label="زيادة الكمية"
        className="h-8 w-8 rounded-full hover:bg-background hover:shadow-sm 
          active:scale-90 transition-all duration-200 disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
});

QuantityControl.displayName = "QuantityControl";

export default QuantityControl;

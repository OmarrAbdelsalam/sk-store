"use client";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { memo } from "react";

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
  disableIncrease?: boolean;
}

const QuantityControl = memo(({ quantity, onIncrease, onDecrease, disabled, disableIncrease }: QuantityControlProps) => {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onDecrease}
        disabled={quantity <= 1 || disabled}
        aria-label="تقليل الكمية"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-lg font-medium min-w-[3rem] text-center">
        {quantity}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onIncrease}
        disabled={disabled || disableIncrease}
        aria-label="زيادة الكمية"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
});

QuantityControl.displayName = "QuantityControl";

export default QuantityControl;

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
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onDecrease}
        aria-label="تقليل الكمية"
        className="active:scale-95 transition-transform"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-lg font-medium min-w-[3rem] text-center tabular-nums transition-all">
        {quantity}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onIncrease}
        disabled={disableIncrease}
        aria-label="زيادة الكمية"
        className="active:scale-95 transition-transform"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
});

QuantityControl.displayName = "QuantityControl";

export default QuantityControl;

"use client";
import { Plus, Minus } from "lucide-react";
import { memo } from "react";

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disableIncrease?: boolean;
}

const QuantityControl = memo(({ quantity, onIncrease, onDecrease, disableIncrease }: QuantityControlProps) => {
  return (
    <div className="inline-flex items-center border border-border">
      <button
        onClick={onDecrease}
        aria-label="Decrease quantity"
        className="h-8 w-8 flex items-center justify-center text-foreground hover:bg-muted transition-colors active:scale-90"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="text-sm font-medium min-w-[2.5rem] text-center tabular-nums select-none border-x border-border">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        disabled={disableIncrease}
        aria-label="Increase quantity"
        className="h-8 w-8 flex items-center justify-center text-foreground hover:bg-muted transition-colors active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
});

QuantityControl.displayName = "QuantityControl";

export default QuantityControl;

"use client";

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropboxImg } from '@/components/DropboxImage';
import { Product } from '@/services/products';

interface SortableItemProps {
  product: Product;
}

function SortableItem({ product }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-3 bg-white border rounded-lg mb-2 ${
        isDragging ? 'shadow-lg border-primary' : 'border-gray-200'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab hover:text-primary p-2">
        <GripVertical size={20} className="text-gray-400" />
      </div>
      <div className="w-12 h-12 rounded bg-gray-50 flex-shrink-0 overflow-hidden border">
        {product.main_image ? (
          <DropboxImg src={product.main_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 truncate">{product.name_en}</p>
        <p className="text-xs text-gray-500 truncate">{product.category?.name_en}</p>
      </div>
      <div className="text-sm font-semibold text-gray-900 w-24 text-right">
        {product.base_price} EGP
      </div>
    </div>
  );
}

interface DraggableProductListProps {
  products: Product[];
  onSave: (orderedIds: string[]) => Promise<void>;
}

export function DraggableProductList({ products, onSave }: DraggableProductListProps) {
  const [items, setItems] = useState<Product[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setItems(products);
    setHasChanges(false);
  }, [products]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasChanges(true);
    }
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(items.map(i => i.id));
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (items.length === 0) {
    return <div className="p-8 text-center text-gray-500 border rounded-lg bg-gray-50">No products found in this section.</div>;
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
        <p className="text-sm text-gray-600">
          Drag and drop items to reorder them. Click save when you're done.
        </p>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isSaving}
          size="sm"
          className="gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Order
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {items.map((product) => (
              <SortableItem key={product.id} product={product} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

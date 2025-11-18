"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CustomModalProps {
  open: boolean;
  title: string;
  message?: string;
  onConfirm?: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export default function CustomModal({
  open,
  title,
  message,
  onConfirm,
  onClose,
  confirmText = "OK",
  cancelText = "Cancel",
  danger = false,
}: CustomModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {message && <DialogDescription>{message}</DialogDescription>}
        </DialogHeader>

        <DialogFooter>
          {onConfirm ? (
            <>
              <Button variant="outline" onClick={onClose}>
                {cancelText}
              </Button>
              <Button
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                className={danger ? "bg-red-600 hover:bg-red-700 text-white" : ""}
              >
                {confirmText}
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>{confirmText}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

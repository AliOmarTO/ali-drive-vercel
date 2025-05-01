'use client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id: number;
    name: string;
    url: string;
  } | null;
}

export function ImagePreviewModal({ isOpen, onClose, image }: ImagePreviewModalProps) {
  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <div className="flex items-center justify-between">
          <DialogTitle>{image.name}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center overflow-hidden rounded-md">
          <img
            src={image.url || '/placeholder.svg'}
            alt={image.name}
            className="max-h-[70vh] w-auto object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

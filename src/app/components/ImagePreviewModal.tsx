'use client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id: number;
    name: string;
    url: string;
    storage_path: string;
  } | null;
}

export function ImagePreviewModal({ isOpen, onClose, image }: ImagePreviewModalProps) {
  const [imageWithUrl, setImageWithUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      setImageWithUrl(null); // Reset the image URL when the image changes
      console.log('pew', image);
      if (image) {
        const response = await fetch(`/api/download?path=${image.url}`);
        const urlData = await response.json();
        setImageWithUrl(urlData.url);
      }
    };

    fetchImage();
  }, [image]);

  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <div className="flex items-center justify-between">
          <DialogTitle>{image.name}</DialogTitle>
          <div className="flex items-center ">
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center overflow-hidden rounded-md">
          <img
            src={imageWithUrl || '/placeholder.svg'}
            alt={image.name}
            className="max-h-[70vh] w-auto object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

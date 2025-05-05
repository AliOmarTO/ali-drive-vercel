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
      if (image) {
        const response = await fetch(`/api/download?path=${image.url}`);
        const urlData = await response.json();
        setImageWithUrl(urlData.url);
      }
    };

    fetchImage();
  }, [image]);

  const handleDownload = async () => {
    if (!imageWithUrl) return;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    try {
      if (isMobile) {
        window.open(imageWithUrl, '_blank');
      } else {
        const response = await fetch(imageWithUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = image?.name || 'download'; // fallback name
        document.body.appendChild(link);
        link.click();

        // Cleanup
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <div className="flex items-center justify-between">
          <DialogTitle>{image.name}</DialogTitle>
          <div className="flex items-center  mt-4">
            <Button variant="outline" size="icon" onClick={handleDownload} disabled={!imageWithUrl}>
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

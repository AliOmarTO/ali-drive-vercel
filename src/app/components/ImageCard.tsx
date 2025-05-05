import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export interface Image {
  id: string;
  userId: string;
  filename: string;
  storage_path: string;
  type: string;
  thumbnail_path: string;
  created_at: string;
  size: number;
}

interface ImageCardProps {
  imageMetadata: Image;
  selected: boolean;
  toggleImageSelection: (id: string) => void;
  handleImageClick: (image: Image) => void;
}

export default function ImageCard({
  imageMetadata,
  selected,
  toggleImageSelection,
  handleImageClick,
}: ImageCardProps) {
  const [imageWithUrl, setImageWithUrl] = useState<Image & { presignedUrl: string }>(); // Stores pre-signed URLs for images

  useEffect(() => {
    // get presigned url for image
    const getPresignedUrl = async (image: Image) => {
      const response = await fetch(`/api/download?path=${image.thumbnail_path}`);
      const urlData = await response.json();
      return {
        ...image, // Include image metadata
        presignedUrl: urlData.url, // Add the pre-signed URL to image metadata
      };
    };

    const fetchImage = async () => {
      try {
        const resImageWithUrl = await getPresignedUrl(imageMetadata);
        // Do something with the image with pre-signed URL
        console.log('Image with pre-signed URL:', resImageWithUrl);
        setImageWithUrl(resImageWithUrl);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, [imageMetadata]);

  if (!imageWithUrl) {
    return (
      <div className="flex h-32 w-32 animate-pulse items-center justify-center rounded-lg border bg-background">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`group relative cursor-pointer rounded-lg border transition-all hover:shadow-md ${
        selected ? 'border-primary bg-primary/5 ' : ''
      }`}
      onClick={() => {
        toggleImageSelection(imageMetadata.id);
        console.log('Image clicked:', selected);
      }}
      onDoubleClick={() => handleImageClick(imageMetadata)}
    >
      <div className="aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={imageWithUrl.presignedUrl || '/placeholder.svg'}
          width={500}
          height={300}
          alt={imageMetadata.filename}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-2">
        <p className="text-sm font-medium line-clamp-1">{imageMetadata.filename}</p>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {' '}
            {(imageMetadata.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <p className="text-xs text-muted-foreground">{imageMetadata.created_at}</p>
        </div>
      </div>
      <div className="absolute right-2 top-2 flex gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 rounded-full bg-background/80 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleImageClick(imageMetadata);
              }}
            >
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Download</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Rename</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

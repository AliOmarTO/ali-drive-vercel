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
import { toast } from 'sonner';

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
  toggleImageSelection: (image: Image) => void;
  handleImageClick: (image: Image) => void;
  onDeleteComplete?: (image: Image) => void;
}

export default function ImageCard({
  imageMetadata,
  selected,
  toggleImageSelection,
  handleImageClick,
  onDeleteComplete,
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

  const handleDelete = async () => {
    const imageToDelete = imageMetadata;
    //const keysToDelete = imagesToDelete.flatMap((img) => [img.thumbnail_path, img.storage_path]);
    try {
      await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucketName: 'my-bucket', images: [imageToDelete] }),
      });
    } catch (error) {
      console.error('Error deleting images:', error);
      toast.error('Error deleting image. Please try again.');
    } finally {
      // Tell the parent which image was deleted
      onDeleteComplete?.(imageToDelete);
      toast.success('Image deleted successfully!');
    }
  };

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
        toggleImageSelection(imageMetadata);
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
      {selected && (
        <div className="absolute left-2 top-2 rounded-full bg-primary p-1 text-primary-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-check"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      )}
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
              className="h-8 w-8 rounded-full bg-background/80 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
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
            <DropdownMenuItem disabled onClick={(e) => e.stopPropagation()}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

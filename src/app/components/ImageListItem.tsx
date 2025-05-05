// components/ImageListItem.tsx
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';

interface ImageListItemProps {
  image: {
    id: string;
    userId: string;
    filename: string;
    storage_path: string;
    type: string;
    thumbnail_path: string;
    created_at: string;
    size: number;
  };
  selected: boolean;
  onSelect: (id: string) => void;
  onDoubleClick: (image: any) => void;
  onPreview: (image: any) => void;
}

export function ImageListItem({
  image,
  selected,
  onSelect,
  onDoubleClick,
  onPreview,
}: ImageListItemProps) {
  return (
    <div
      key={`image-list-${image.id}`}
      className={`grid grid-cols-12 gap-4 border-b p-3 text-sm last:border-0 hover:bg-muted/50 ${
        selected ? 'bg-primary/5' : ''
      }`}
      onClick={() => onSelect(image.id)}
      onDoubleClick={() => onDoubleClick(image)}
    >
      <div className="col-span-6 flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded flex-shrink-0">
          <Image
            width={40}
            height={40}
            src={image.thubmnail || '/placeholder.svg'}
            alt={image.filename}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="font-medium">{image.filename}</span>
      </div>
      <div className="col-span-2 flex items-center text-muted-foreground">
        {(image.size / (1024 * 1024)).toFixed(2)} MB
      </div>
      <div className="col-span-3 flex items-center text-muted-foreground">{image.created_at}</div>
      <div className="col-span-1 flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onPreview(image);
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

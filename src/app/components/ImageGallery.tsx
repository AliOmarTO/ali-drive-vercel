'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Grid, List, MoreHorizontal, Plus, Search, Trash2, Upload, Users } from 'lucide-react';
import { ImagePreviewModal } from './ImagePreviewModal';
import Sidebar from './Sidebar';
import ImageCard from './ImageCard';

// Mock image data - replace with your actual image data
const mockImages = [
  {
    id: 1,
    name: 'Beach Sunset.jpg',
    size: '3.2 MB',
    modified: 'Apr 28, 2025',
    shared: true,
    thumbnail: '/placeholder.svg?height=200&width=200',
  },
  {
    id: 2,
    name: 'Mountain View.png',
    size: '5.1 MB',
    modified: 'Apr 25, 2025',
    shared: false,
    thumbnail: '/placeholder.svg?height=200&width=200',
  },
  {
    id: 3,
    name: 'Family Portrait.jpg',
    size: '4.8 MB',
    modified: 'Apr 22, 2025',
    shared: true,
    thumbnail: '/placeholder.svg?height=200&width=200',
  },
  {
    id: 4,
    name: 'Profile Picture.jpg',
    size: '2.2 MB',
    modified: 'Apr 20, 2025',
    shared: false,
    thumbnail: '/placeholder.svg?height=200&width=200',
  },
  {
    id: 5,
    name: 'Company Logo.png',
    size: '1.5 MB',
    modified: 'Apr 15, 2025',
    shared: true,
    thumbnail: '/placeholder.svg?height=200&width=200',
  },
  {
    id: 6,
    name: 'Beach Waves.jpg',
    size: '3.7 MB',
    modified: 'Apr 12, 2025',
    shared: false,
    thumbnail: '/placeholder.svg?height=200&width=200',
  },
  {
    id: 7,
    name: 'Sunset View.jpg',
    size: '4.1 MB',
    modified: 'Apr 10, 2025',
    shared: true,
    thumbnail: '/placeholder.svg?height=200&width=200',
  },
  {
    id: 8,
    name: 'Team Photo.jpg',
    size: '5.3 MB',
    modified: 'Apr 8, 2025',
    shared: true,
    thumbnail: '/placeholder.svg?height=200&width=200',
  },
];

interface ImageMetadata {
  id: string;
  userId: string;
  filename: string;
  storage_path: string;
  type: string;
  thumbnail_path: string;
  created_at: string;
  size: number;
}

export function ImageGallery() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagesMetadata, setImagesMetadata] = useState<ImageMetadata[]>([]); // Store image metadata
  const [page, setPage] = useState<number>(1); // Pagination state
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [previewImage, setPreviewImage] = useState<{
    id: string;
    name: string;
    url: string;
  } | null>(null);

  // Filter images based on search term
  const filteredImages = searchTerm
    ? mockImages.filter((image) => image.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : mockImages;

  // retrieve images metadata from server api
  useEffect(() => {
    const fetchImagesMetadata = async () => {
      try {
        const response = await fetch(`/api/download-metadata?page=${page}`);
        const data = await response.json();

        setImagesMetadata(data.images);
        setTotalPages(data.totalPages); // Assuming your API returns total pages
      } catch (error) {
        console.error('Error fetching images metadata:', error);
      }
    };

    fetchImagesMetadata();
  }, []);

  const toggleImageSelection = (id: number) => {
    if (selectedImages.includes(id)) {
      setSelectedImages(selectedImages.filter((imageId) => imageId !== id));
    } else {
      setSelectedImages([...selectedImages, id]);
    }
  };

  const handleUpload = () => {
    // Trigger file upload functionality for images only
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*'; // Only accept image files
    input.onchange = (e) => {
      // Your existing file upload logic here
      console.log('Images selected:', (e.target as HTMLInputElement).files);
    };
    input.click();
  };

  const handleImageClick = (image: ImageMetadata) => {
    setPreviewImage({
      id: image.id,
      name: image.filename,
      url: image.storage_path, // In a real app, this would be the full-size image URL
    });
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar handleUpload={handleUpload} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-2 md:w-1/3">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search images..."
                className="w-full rounded-md pl-8 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-accent' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-accent' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleUpload} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Selected Images Actions */}

          {selectedImages.length > 0 && (
            <div className="mb-4 flex items-center justify-between rounded-lg border bg-background p-2">
              <div className="pl-2">
                <span className="text-sm font-medium">{selectedImages.length} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedImages([])}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Images Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {imagesMetadata.map((image) => (
                <ImageCard
                  key={`image-${image.id}`}
                  imageMetadata={image}
                  selected={selectedImages.includes(image.id)}
                  toggleImageSelection={toggleImageSelection}
                  handleImageClick={handleImageClick}
                />
                // <div
                //   key={`image-${image.id}`}
                //   className={`group relative cursor-pointer rounded-lg border transition-all hover:shadow-md ${
                //     selectedImages.includes(image.id) ? 'border-primary bg-primary/5' : ''
                //   }`}
                //   onClick={() => toggleImageSelection(image.id)}
                //   onDoubleClick={() => handleImageClick(image)}
                // >
                //   <div className="aspect-square overflow-hidden rounded-t-lg">
                //     <img
                //       src={image.thumbnail || '/placeholder.svg'}
                //       alt={image.name}
                //       className="h-full w-full object-cover"
                //     />
                //   </div>
                //   <div className="p-2">
                //     <p className="text-sm font-medium line-clamp-1">{image.name}</p>
                //     <p className="text-xs text-muted-foreground">{image.size}</p>
                //   </div>
                //   <div className="absolute right-2 top-2 flex gap-1">
                //     {image.shared && (
                //       <div className="rounded-full bg-background/80 p-1">
                //         <Users className="h-3.5 w-3.5 text-muted-foreground" />
                //       </div>
                //     )}
                //     <DropdownMenu>
                //       <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                //         <Button
                //           variant="secondary"
                //           size="icon"
                //           className="h-6 w-6 rounded-full bg-background/80 opacity-0 group-hover:opacity-100"
                //         >
                //           <MoreHorizontal className="h-3.5 w-3.5" />
                //         </Button>
                //       </DropdownMenuTrigger>
                //       <DropdownMenuContent align="end">
                //         <DropdownMenuItem
                //           onClick={(e) => {
                //             e.stopPropagation();
                //             handleImageClick(image);
                //           }}
                //         >
                //           Preview
                //         </DropdownMenuItem>
                //         <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                //           Download
                //         </DropdownMenuItem>
                //         <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                //           Share
                //         </DropdownMenuItem>
                //         <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                //           Rename
                //         </DropdownMenuItem>
                //         <DropdownMenuItem
                //           className="text-destructive"
                //           onClick={(e) => e.stopPropagation()}
                //         >
                //           Delete
                //         </DropdownMenuItem>
                //       </DropdownMenuContent>
                //     </DropdownMenu>
                //   </div>
                // </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border">
              <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 p-3 text-xs font-medium">
                <div className="col-span-6">Name</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-3">Modified</div>
                <div className="col-span-1"></div>
              </div>

              {filteredImages.map((image) => (
                <div
                  key={`image-list-${image.id}`}
                  className={`grid grid-cols-12 gap-4 border-b p-3 text-sm last:border-0 hover:bg-muted/50 ${
                    selectedImages.includes(image.id) ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => toggleImageSelection(image.id)}
                  onDoubleClick={() => handleImageClick(image)}
                >
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded flex-shrink-0">
                      <img
                        src={image.thumbnail || '/placeholder.svg'}
                        alt={image.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="font-medium">{image.name}</span>
                    {image.shared && <Users className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="col-span-2 flex items-center text-muted-foreground">
                    {image.size}
                  </div>
                  <div className="col-span-3 flex items-center text-muted-foreground">
                    {image.modified}
                  </div>
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
                            handleImageClick(image);
                          }}
                        >
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {filteredImages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 rounded-full bg-muted/50 p-4">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-medium">No images found</h3>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                {searchTerm ? 'Try a different search term' : 'Upload images to get started'}
              </p>
              <Button onClick={handleUpload}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Images
              </Button>
            </div>
          )}
        </main>
      </div>
      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={previewImage !== null}
        onClose={closeImagePreview}
        image={previewImage}
      />
    </div>
  );
}

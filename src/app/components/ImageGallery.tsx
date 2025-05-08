'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Grid, List, Plus, Search, Trash2, Upload } from 'lucide-react';
import { ImagePreviewModal } from './ImagePreviewModal';
import Sidebar from './Sidebar';
import ImageCard, { Image } from './ImageCard';
import { ImageListItem } from './ImageListItem';
import MultiFileUploader from './UploadProgress/multiFileUploader';
import { toast } from 'sonner';

// Mock image data - replace with your actual image data
// const mockImages = [
//   {
//     id: 1,
//     name: 'Beach Sunset.jpg',
//     size: '3.2 MB',
//     modified: 'Apr 28, 2025',
//     shared: true,
//     thumbnail: '/placeholder.svg?height=200&width=200',
//   },
//   {
//     id: 2,
//     name: 'Mountain View.png',
//     size: '5.1 MB',
//     modified: 'Apr 25, 2025',
//     shared: false,
//     thumbnail: '/placeholder.svg?height=200&width=200',
//   },
//   {
//     id: 3,
//     name: 'Family Portrait.jpg',
//     size: '4.8 MB',
//     modified: 'Apr 22, 2025',
//     shared: true,
//     thumbnail: '/placeholder.svg?height=200&width=200',
//   },
//   {
//     id: 4,
//     name: 'Profile Picture.jpg',
//     size: '2.2 MB',
//     modified: 'Apr 20, 2025',
//     shared: false,
//     thumbnail: '/placeholder.svg?height=200&width=200',
//   },
//   {
//     id: 5,
//     name: 'Company Logo.png',
//     size: '1.5 MB',
//     modified: 'Apr 15, 2025',
//     shared: true,
//     thumbnail: '/placeholder.svg?height=200&width=200',
//   },
//   {
//     id: 6,
//     name: 'Beach Waves.jpg',
//     size: '3.7 MB',
//     modified: 'Apr 12, 2025',
//     shared: false,
//     thumbnail: '/placeholder.svg?height=200&width=200',
//   },
//   {
//     id: 7,
//     name: 'Sunset View.jpg',
//     size: '4.1 MB',
//     modified: 'Apr 10, 2025',
//     shared: true,
//     thumbnail: '/placeholder.svg?height=200&width=200',
//   },
//   {
//     id: 8,
//     name: 'Team Photo.jpg',
//     size: '5.3 MB',
//     modified: 'Apr 8, 2025',
//     shared: true,
//     thumbnail: '/placeholder.svg?height=200&width=200',
//   },
// ];

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
  const [selectedImages, setSelectedImages] = useState<ImageMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagesMetadata, setImagesMetadata] = useState<ImageMetadata[]>([]); // Store image metadata
  const [page, setPage] = useState<number>(1); // Pagination state
  const [hasMore, setHasMore] = useState(true); // Flag to check if more images are available
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [previewImage, setPreviewImage] = useState<{
    id: string;
    name: string;
    url: string;
    storage_path: string;
  } | null>(null);

  // Inside your component
  const totalSize = useMemo(() => {
    return imagesMetadata.reduce((sum, image) => sum + image.size, 0);
  }, [imagesMetadata]);

  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  // Filter images based on search term
  // const filteredImages = searchTerm
  //   ? mockImages.filter((image) => image.name.toLowerCase().includes(searchTerm.toLowerCase()))
  //   : mockImages;

  useEffect(() => {
    loadImages(page);
  }, [page]);

  // retrieve images metadata from server api
  const loadImages = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/download-metadata?page=${page}`);
      const data = await response.json();

      setImagesMetadata((prev) => [...prev, ...data.images]);
      setTotalPages(data.totalPages); // Assuming your API returns total pages
      setHasMore(data.totalPages > page); // Check if more pages are available
      setLoading(false);
      console.log('Images metadata:', data.hasMore);
    } catch (error) {
      console.error('Error fetching images metadata:', error);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      console.log(totalPages);
    }
  };

  const toggleImageSelection = (imageSelected: ImageMetadata) => {
    console.log(selectedImages);
    if (selectedImages.includes(imageSelected)) {
      setSelectedImages(selectedImages.filter((imageId) => imageId.id !== imageSelected.id));
    } else {
      setSelectedImages([...selectedImages, imageSelected]);
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
      storage_path: image.storage_path,
    });
  };

  // handles single image deletion in child components card and list item
  const handleImageDeleted = (deletedImage: Image) => {
    // Clear selected images after deletion
    setSelectedImages([]);
    setImagesMetadata((prev) => prev.filter((img) => img.id !== deletedImage.id));
  };

  // handles multiple image deletion from the action bar
  const handleDelete = async () => {
    const imagesToDelete = selectedImages.filter((img) => img.id !== undefined);
    //const keysToDelete = imagesToDelete.flatMap((img) => [img.thumbnail_path, img.storage_path]);
    try {
      await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucketName: 'my-bucket', images: imagesToDelete }),
      });
    } catch (error) {
      console.error('Error deleting images:', error);
      toast.error('Error deleting images. Please try again.');
    } finally {
      // refresh the image list after deletion
      setSelectedImages([]);
      setImagesMetadata((prev) => prev.filter((img) => !imagesToDelete.includes(img)));
      toast.success('Images deleted successfully!');
    }
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  if (loading) {
    return;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar handleUpload={handleUpload} totalSize={Number(totalSizeMB)} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-auto flex-col border-b px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0 md:px-6">
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

          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <div className="flex items-center gap-1">
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
            </div>
            {/* <Button variant="outline" onClick={handleUpload} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Button> */}
            <MultiFileUploader />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Selected Images Actions */}
          {selectedImages.length > 0 && (
            <div className="mb-4 flex flex-col sm:flex-row items-center justify-between rounded-lg border bg-background p-2 sticky top-0 z-30">
              {selectedImages.length > 0 ? (
                <>
                  <div className="pl-2 mb-2 sm:mb-0">
                    <span className="text-sm font-medium">{selectedImages.length} selected</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive flex-1 sm:flex-initial"
                      onClick={handleDelete}
                    >
                      <Trash2 className="mr-2 h-4 w-4 sm:mr-2" />
                      Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 sm:flex-initial"
                      onClick={() => setSelectedImages([])}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Images Display */}
          {/* Grid */}
          {viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-2 gap-3 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {imagesMetadata.map((image) => (
                  <ImageCard
                    key={`image-${image.id}`}
                    imageMetadata={image}
                    selected={selectedImages.includes(image)}
                    toggleImageSelection={toggleImageSelection}
                    handleImageClick={handleImageClick}
                    onDeleteComplete={handleImageDeleted}
                  />
                ))}
              </div>
              <div className="flex justify-center mt-4">
                {hasMore ? (
                  <Button onClick={handleLoadMore} disabled={loading}>
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                ) : (
                  <span className="text-muted-foreground">No more images</span>
                )}
              </div>
            </>
          ) : (
            /* List */
            <div className="rounded-lg border">
              <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 p-3 text-xs font-medium">
                <div className="col-span-6">Name</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-3">Modified</div>
                <div className="col-span-1"></div>
              </div>

              {imagesMetadata.map((image) => (
                <ImageListItem
                  key={image.id}
                  image={image}
                  selected={selectedImages.includes(image)}
                  onSelect={toggleImageSelection}
                  onDoubleClick={handleImageClick}
                  onPreview={handleImageClick}
                  onDeleteComplete={handleImageDeleted}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {imagesMetadata.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 rounded-full bg-muted/50 p-4">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-medium">No images found</h3>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                {searchTerm ? 'Try a different search term' : 'Upload images to get started'}
              </p>
              <MultiFileUploader />
              {/* <Button onClick={handleUpload}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Images
              </Button> */}
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

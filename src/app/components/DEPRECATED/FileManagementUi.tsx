'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  FolderIcon,
  Grid,
  List,
  MoreHorizontal,
  Search,
  Share2,
  Trash2,
  Upload,
  Users,
  Download,
} from 'lucide-react';
import React from 'react';
import { ImagePreviewModal } from '../ImagePreviewModal';
import Sidebar from '../Sidebar';

// Update the mock data to only include image files
const mockData = {
  currentPath: ['My Images'],
  folders: [
    {
      id: 101,
      name: 'Vacation Photos',
      path: ['My Images', 'Vacation Photos'],
      modified: 'Apr 28, 2025',
      shared: false,
    },
    {
      id: 102,
      name: 'Work Images',
      path: ['My Images', 'Work Images'],
      modified: 'Apr 25, 2025',
      shared: true,
    },
    {
      id: 103,
      name: 'Profile Pictures',
      path: ['My Images', 'Profile Pictures'],
      modified: 'Apr 22, 2025',
      shared: false,
    },
  ],
  files: [
    {
      id: 1,
      name: 'Beach Sunset.jpg',
      type: 'image',
      size: '3.2 MB',
      modified: 'Apr 28, 2025',
      shared: true,
      path: ['My Images'],
      thumbnail: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 2,
      name: 'Mountain View.png',
      type: 'image',
      size: '5.1 MB',
      modified: 'Apr 25, 2025',
      shared: false,
      path: ['My Images'],
      thumbnail: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 3,
      name: 'Family Portrait.jpg',
      type: 'image',
      size: '4.8 MB',
      modified: 'Apr 22, 2025',
      shared: true,
      path: ['My Images'],
      thumbnail: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 4,
      name: 'Profile Picture.jpg',
      type: 'image',
      size: '2.2 MB',
      modified: 'Apr 20, 2025',
      shared: false,
      path: ['My Images', 'Profile Pictures'],
      thumbnail: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 5,
      name: 'Company Logo.png',
      type: 'image',
      size: '1.5 MB',
      modified: 'Apr 15, 2025',
      shared: true,
      path: ['My Images', 'Work Images'],
      thumbnail: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 6,
      name: 'Beach Waves.jpg',
      type: 'image',
      size: '3.7 MB',
      modified: 'Apr 12, 2025',
      shared: false,
      path: ['My Images', 'Vacation Photos'],
      thumbnail: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 7,
      name: 'Sunset View.jpg',
      type: 'image',
      size: '4.1 MB',
      modified: 'Apr 10, 2025',
      shared: true,
      path: ['My Images', 'Vacation Photos'],
      thumbnail: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 8,
      name: 'Team Photo.jpg',
      type: 'image',
      size: '5.3 MB',
      modified: 'Apr 8, 2025',
      shared: true,
      path: ['My Images', 'Work Images'],
      thumbnail: '/placeholder.svg?height=200&width=200',
    },
  ],
};

interface ImageMetadata {
  id: string;
  userId: string;
  filename: string;
  storage_path: string;
  type: string;
  thumbnail_path: string;
  created_at: string;
}

export default function FileManagementUI() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<{ id: number; type: 'file' | 'folder' }[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>(['My Images']);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageMetadata[]>([]); // Store image data
  const [imageUrls, setImageUrls] = useState<(ImageMetadata & { presignedUrl: string })[]>([]); // Stores pre-signed URLs for images
  const [page, setPage] = useState<number>(1); // Pagination state
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [previewImage, setPreviewImage] = useState<{
    id: number;
    name: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    const fetchImagesWithUrls = async () => {
      setLoading(true); // Start loading before fetching
      try {
        // Step 1: Fetch image metadata with pagination
        const metadataRes = await fetch(`/api/download-metadata?page=${page}`);
        if (!metadataRes.ok) {
          throw new Error('Failed to fetch images metadata');
        }
        const metadataData = await metadataRes.json();

        console.log('Fetched metadata:', metadataData);
        setImages(metadataData.images);
        setTotalPages(metadataData.totalPages); // Set the total pages from metadata

        // Step 2: Fetch pre-signed URLs for each image
        const urls = await Promise.all(
          metadataData.images.map(async (image: ImageMetadata) => {
            const urlRes = await fetch(`/api/download?path=${image.thumbnail_path}`);
            const urlData = await urlRes.json();
            return {
              ...image, // Include image metadata
              presignedUrl: urlData.url, // Add the pre-signed URL to image metadata
            };
          })
        );
        console.log('Fetched URLs:', urls);
        setImageUrls(urls); // Set the image URLs
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false); // Stop loading after the process
      }
    };

    fetchImagesWithUrls();
  }, [page]); // Refetch when the page changes

  // Filter files and folders based on current path
  const currentFolders = mockData.folders.filter((folder) =>
    arraysEqual(folder.path.slice(0, -1), currentPath)
  );
  const currentFiles = mockData.files.filter((file) => arraysEqual(file.path, currentPath));

  // Helper function to compare arrays
  function arraysEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  const toggleItemSelection = (id: number, type: 'file' | 'folder') => {
    const item = { id, type };
    if (selectedItems.some((i) => i.id === id && i.type === type)) {
      setSelectedItems(selectedItems.filter((i) => !(i.id === id && i.type === type)));
    } else {
      setSelectedItems([...selectedItems, item]);
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
      console.log('Current path for upload:', currentPath);
    };
    input.click();
  };

  const navigateToFolder = (folderPath: string[]) => {
    setCurrentPath(folderPath);
    setSelectedItems([]);
  };

  const navigateUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedItems([]);
    }
  };

  const createNewFolder = () => {
    if (newFolderName.trim()) {
      // In a real app, you would call your API to create the folder
      // and then update your state with the new folder
      const newFolder = {
        id: Math.max(...mockData.folders.map((f) => f.id)) + 1,
        name: newFolderName,
        path: [...currentPath, newFolderName],
        modified: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        shared: false,
      };

      // Add the new folder to our mock data
      mockData.folders.push(newFolder);

      // Reset state
      setNewFolderName('');
      setShowNewFolderDialog(false);
    }
  };

  const handleItemDoubleClick = (item: { id: number; type: 'file' | 'folder' }) => {
    if (item.type === 'folder') {
      const folder = mockData.folders.find((f) => f.id === item.id);
      if (folder) {
        navigateToFolder(folder.path);
      }
    } else {
      // Open image preview
      const file = mockData.files.find((f) => f.id === item.id);
      if (file) {
        setPreviewImage({
          id: file.id,
          name: file.name,
          url: file.thumbnail, // In a real app, this would be the full-size image URL
        });
      }
    }
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        handleUpload={handleUpload}
        setShowNewFolderDialog={setShowNewFolderDialog}
        arraysEqual={arraysEqual}
        currentPath={currentPath}
        navigateToFolder={navigateToFolder}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-2 md:w-1/3">
            <Button variant="ghost" size="icon" className="md:hidden">
              <ChevronDown className="h-4 w-4" />
            </Button>
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search images..."
                className="w-full rounded-md pl-8 md:w-[300px]"
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
            <Button variant="ghost" size="icon" onClick={handleUpload}>
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Breadcrumb Navigation */}
          <div className="mb-4 flex items-center">
            {currentPath.length > 1 && (
              <Button variant="ghost" size="sm" onClick={navigateUp} className="mr-2">
                <ChevronDown className="h-4 w-4 rotate-90" />
              </Button>
            )}
            <nav className="flex items-center space-x-1 text-sm">
              {currentPath.map((segment, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-muted-foreground">/</span>}
                  <Button
                    variant="link"
                    className="h-auto p-1"
                    onClick={() => navigateToFolder(currentPath.slice(0, index + 1))}
                  >
                    {segment}
                  </Button>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* New Folder Dialog */}
          {showNewFolderDialog && (
            <div className="mb-4 rounded-lg border p-4">
              <h3 className="mb-2 text-lg font-medium">Create New Folder</h3>
              <div className="flex gap-2">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1"
                />
                <Button onClick={createNewFolder}>Create</Button>
                <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <Tabs defaultValue="all">
            <div className="mb-4 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="folders">Folders</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>

              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="all" className="mt-0">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {/* Folders */}
                  {currentFolders.map((folder) => (
                    <div
                      key={`folder-${folder.id}`}
                      className={`group relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                        selectedItems.some((i) => i.id === folder.id && i.type === 'folder')
                          ? 'border-primary bg-primary/5'
                          : ''
                      }`}
                      onClick={() => toggleItemSelection(folder.id, 'folder')}
                      onDoubleClick={() => handleItemDoubleClick({ id: folder.id, type: 'folder' })}
                    >
                      <div className="mb-4 flex h-32 items-center justify-center rounded bg-muted/50">
                        <FolderIcon className="h-16 w-16 text-yellow-500" />
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground line-clamp-1">
                            {folder.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">{folder.modified}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleItemDoubleClick({ id: folder.id, type: 'folder' });
                              }}
                            >
                              Open
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

                  {/* Image Files with Thumbnails */}
                  {imageUrls.map((file) => (
                    <div
                      key={`file-${file.id}`}
                      className={`group relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                        selectedItems.some((i) => i.id === file.id && i.type === 'file')
                          ? 'border-primary bg-primary/5'
                          : ''
                      }`}
                      onClick={() => toggleItemSelection(file.id, 'file')}
                      onDoubleClick={() => handleItemDoubleClick({ id: file.id, type: 'file' })}
                    >
                      <div className="mb-4 h-32 rounded bg-muted/50 overflow-hidden">
                        {/* Display image thumbnail instead of icon */}
                        <img
                          src={file.presignedUrl || '/placeholder.svg'}
                          alt={file.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground line-clamp-1">
                            {file.filename}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {file.created_at} · {file.size}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
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
              ) : (
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 p-3 text-xs font-medium">
                    <div className="col-span-6">Name</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-3">Modified</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Folders in list view */}
                  {currentFolders.map((folder) => (
                    <div
                      key={`folder-list-${folder.id}`}
                      className={`grid grid-cols-12 gap-4 border-b p-3 text-sm last:border-0 hover:bg-muted/50 ${
                        selectedItems.some((i) => i.id === folder.id && i.type === 'folder')
                          ? 'bg-primary/5'
                          : ''
                      }`}
                      onClick={() => toggleItemSelection(folder.id, 'folder')}
                      onDoubleClick={() => handleItemDoubleClick({ id: folder.id, type: 'folder' })}
                    >
                      <div className="col-span-6 flex items-center gap-3">
                        <FolderIcon className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">{folder.name}</span>
                      </div>
                      <div className="col-span-2 flex items-center text-muted-foreground">--</div>
                      <div className="col-span-3 flex items-center text-muted-foreground">
                        {folder.modified}
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
                                handleItemDoubleClick({ id: folder.id, type: 'folder' });
                              }}
                            >
                              Open
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

                  {/* Image files in list view */}
                  {currentFiles.map((file) => (
                    <div
                      key={`file-list-${file.id}`}
                      className={`grid grid-cols-12 gap-4 border-b p-3 text-sm last:border-0 hover:bg-muted/50 ${
                        selectedItems.some((i) => i.id === file.id && i.type === 'file')
                          ? 'bg-primary/5'
                          : ''
                      }`}
                      onClick={() => toggleItemSelection(file.id, 'file')}
                      onDoubleClick={() => handleItemDoubleClick({ id: file.id, type: 'file' })}
                    >
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={file.thumbnail || '/placeholder.svg'}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <div className="col-span-2 flex items-center text-muted-foreground">
                        {file.size}
                      </div>
                      <div className="col-span-3 flex items-center text-muted-foreground">
                        {file.modified}
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
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
            </TabsContent>

            <TabsContent value="folders">
              <div className="text-center py-8 text-muted-foreground">
                Filter applied: Folders only
              </div>
            </TabsContent>

            <TabsContent value="images">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {currentFiles.map((file) => (
                  <div
                    key={`image-${file.id}`}
                    className={`group relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                      selectedItems.some((i) => i.id === file.id && i.type === 'file')
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                    onClick={() => toggleItemSelection(file.id, 'file')}
                    onDoubleClick={() => handleItemDoubleClick({ id: file.id, type: 'file' })}
                  >
                    <div className="mb-4 h-32 rounded bg-muted/50 overflow-hidden">
                      <img
                        src={file.thumbnail || '/placeholder.svg'}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground line-clamp-1">{file.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {file.modified} · {file.size}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
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
                    {file.shared && (
                      <div className="absolute right-2 top-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
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

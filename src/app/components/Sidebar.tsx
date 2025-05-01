// components/Sidebar.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, ChevronDown, FolderIcon, Upload, ImageIcon, Star, Trash2 } from 'lucide-react';

export default function Sidebar({
  handleUpload,
  setShowNewFolderDialog,
  arraysEqual,
  currentPath,
  navigateToFolder,
}: {
  handleUpload: () => void;
  setShowNewFolderDialog: (value: boolean) => void;
  arraysEqual: (a: any[], b: any[]) => boolean;
  currentPath: string[];
  navigateToFolder: (path: string[]) => void;
}) {
  return (
    <div className="hidden w-64 flex-shrink-0 border-r bg-background p-4 md:block">
      <div className="mb-8 space-y-2">
        <Button className="w-full justify-start gap-2 pl-3" onClick={handleUpload}>
          <Plus className="h-4 w-4" />
          Upload Images
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2 pl-3">
              <Plus className="h-4 w-4" />
              Create New
              <ChevronDown className="ml-auto h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setShowNewFolderDialog(true)}>
              <FolderIcon className="mr-2 h-4 w-4" />
              New Folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Images
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="space-y-1">
        <Button
          variant={arraysEqual(currentPath, ['My Images']) ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-2 pl-3"
          onClick={() => navigateToFolder(['My Images'])}
        >
          <ImageIcon className="h-4 w-4" />
          My Images
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-2 pl-3">
          <Star className="h-4 w-4" />
          Favorites
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-2 pl-3">
          <Trash2 className="h-4 w-4" />
          Trash
        </Button>
      </nav>

      <div className="mt-8 border-t pt-4">
        <div className="text-sm font-medium text-muted-foreground">Storage</div>
        <div className="mt-2">
          <div className="mb-1 flex justify-between text-xs">
            <span>7.5 GB used</span>
            <span>50%</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 w-1/2 rounded-full bg-primary"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

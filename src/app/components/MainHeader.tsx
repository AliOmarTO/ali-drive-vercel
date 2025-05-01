// components/Header.tsx

import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Grid, List, Upload, Search } from 'your-icons'; // Replace with your icons
import { useViewMode } from 'your-hooks'; // Adjust based on where the state is coming from

interface HeaderProps {
  setViewMode: (mode: string) => void;
  handleUpload: () => void;
  viewMode: string;
}

const Header: FC<HeaderProps> = ({ setViewMode, handleUpload, viewMode }) => {
  return (
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
  );
};

export default Header;

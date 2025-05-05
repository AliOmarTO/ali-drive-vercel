'use client';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { CircleX, X } from 'lucide-react';
import { useEffect } from 'react';

export type FileUploadStatus = {
  file: File;
  progress: number;
  done: boolean;
  error?: string;
};

export function ProgressBarItem({
  upload,
  onRemove,
}: {
  upload: FileUploadStatus;
  onRemove: (fileName: string) => void;
}) {
  // Auto-remove completed uploads after 3 seconds
  useEffect(() => {
    if (upload.done) {
      const timeout = setTimeout(() => {
        // Logic to remove the upload from the list
        // This could be a function passed down as a prop or a context update
        // For now, we just log it
        console.log('Upload completed:', upload.file.name);
        onRemove(upload.file.name);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [onRemove, upload.done, upload.file.name]);
  return (
    <div
      className={cn(
        'mb-2 rounded-lg border bg-card p-3 shadow-sm',
        status === 'error' && 'border-destructive bg-destructive/10'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xs font-medium text-primary">
              {upload.error ? <CircleX /> : upload.done ? '✓' : `${Math.round(upload.progress)}%`}
            </span>
          </div>

          <div className="truncate">
            <p className="truncate text-sm font-medium">{upload.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(upload.file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          {/* <p className="text-xs truncate">{upload.file.name}</p>
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                      className={`h-2 rounded ${
                        upload.done ? 'bg-green-500' : upload.error ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div> */}
        </div>
        <button
          onClick={() => onRemove(upload.file.name)}
          className="ml-2 rounded-full p-1 hover:bg-muted"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </button>
      </div>
      {!upload.done && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              className={`h-2 rounded ${
                upload.done ? 'bg-green-500' : upload.error ? 'bg-red-400' : 'bg-blue-500'
              }`}
              style={{ width: `${upload.progress}%` }}
            />
          </div>
          {/* <Progress value={upload.progress} className={`h-2 rounded `} /> */}
        </div>
      )}
    </div>
  );
}

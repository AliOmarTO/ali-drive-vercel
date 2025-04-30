'use client';

import { getUploadPreSignedUrl, uploadMetadata } from '@/server/functions/upload';
import { useState } from 'react';

type FileUploadStatus = {
  file: File;
  progress: number;
  done: boolean;
  error?: string;
};

export default function MultiFileUploader({ userId }: { userId: string }) {
  const [uploads, setUploads] = useState<FileUploadStatus[]>([]);
  const [showOverlay, setShowOverlay] = useState(true);

  // Function to upload a file to R2 with progress tracking
  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // create an array of file objects passed with progress and done status
    const fileArray = Array.from(files).map((file) => ({
      file,
      progress: 0,
      done: false,
    }));
    setUploads(fileArray); // Initialize uploads state
    setShowOverlay(true);

    // run all uploads in parallel and wait until they are all finished
    await Promise.all(
      fileArray.map(async (item, index) => {
        try {
          // Step 1 Fetch the upload Pre-Signed URL
          const url = await getUploadPreSignedUrl(item.file.name, item.file.size, item.file.type);

          // 2. Upload to R2 with progress tracking
          if (!url) {
            throw new Error('Failed to fetch upload pre-signed URL');
          }
          await uploadFileWithProgress(url, item.file, (progress) => {
            setUploads((prev) => {
              const updated = [...prev];
              updated[index].progress = progress;
              return updated;
            });
          });

          //path to the file in the bucket
          const storagePath = `${userId}/${item.file.name}`;

          // Step 3 Upload metadata to the database
          await uploadMetadata(
            item.file.name,
            item.file.size,
            item.file.type,
            userId!,
            storagePath
          );

          setUploads((prev) => {
            const updated = [...prev];
            updated[index].done = true;
            return updated;
          });
        } catch (err: unknown) {
          setUploads((prev) => {
            const updated = [...prev];
            updated[index].error = err instanceof Error ? err.message : 'Unknown error';
            return updated;
          });
        }
      })
    );
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFiles} />

      {uploads.length > 0 && showOverlay && (
        <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg p-4 space-y-2 z-50">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm">Uploading Files</h4>
            <button
              onClick={() => setShowOverlay(false)}
              className="text-gray-500 hover:text-gray-800 text-sm"
            >
              ✕
            </button>
          </div>

          {uploads.map((upload, i) => (
            <div key={i}>
              <p className="text-xs truncate">{upload.file.name}</p>
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className={`h-2 rounded ${
                    upload.done ? 'bg-green-500' : upload.error ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Uploads a file to R2 with progress tracking using XMLHttpRequest
// better built in support for large file streaming
async function uploadFileWithProgress(
  url: string, // Pre-signed URL
  file: File, // File to upload
  onProgress: (progress: number) => void // Progress callback to update progress bar
): Promise<void> {
  // Create a new XMLHttpRequest promise
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    // Open a PUT request to the pre-signed URL
    xhr.open('PUT', url);

    // setup the onprogress event to track upload progress
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    // handles the sucessful upload
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error('Upload failed'));
      }
    };

    // handle the error
    xhr.onerror = () => reject(new Error('XHR error'));
    // start the upload and send the file to R2
    xhr.send(file);
  });
}

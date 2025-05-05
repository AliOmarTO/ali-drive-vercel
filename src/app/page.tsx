'use client';

import { ImageGallery } from './components/ImageGallery';
import MultiFileUploader from './components/UploadProgress/multiFileUploader';
import { useAuth } from '@clerk/nextjs';

export default function Home() {
  const { userId } = useAuth();
  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24  bg-gray-500">
    //
    // </main>
    <div>
      <MultiFileUploader userId={userId ?? ''} />
      <ImageGallery />
    </div>
  );
}

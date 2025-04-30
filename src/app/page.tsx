'use client';

import ImageGallery from './components/ImageGallery';
import MultiFileUploader from './components/multiFileUploader';
import { useAuth } from '@clerk/nextjs';

export default function Home() {
  const { userId } = useAuth();

  if (!userId) {
    return <></>;
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24  bg-gray-500">
      <MultiFileUploader userId={userId} />
      <ImageGallery userId={userId} />
    </main>
  );
}

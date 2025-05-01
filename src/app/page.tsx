'use client';

import FileManagementUI from './components/DEPRECATED/FileManagementUi';
import { ImageGallery } from './components/ImageGallery';
import MultiFileUploader from './components/DEPRECATED/multiFileUploader';

export default function Home() {
  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24  bg-gray-500">
    //   <MultiFileUploader userId={userId} />
    //   <ImageGallery />
    // </main>
    <ImageGallery />
  );
}

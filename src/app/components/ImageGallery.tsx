'use client';

import { useEffect, useState } from 'react';

interface ImageMetadata {
  id: string;
  userId: string;
  filename: string;
  storage_path: string;
  type: string;
}

export default function ImageGallery() {
  const [images, setImages] = useState<ImageMetadata[]>([]); // Store image data
  const [imageUrls, setImageUrls] = useState<(ImageMetadata & { presignedUrl: string })[]>([]); // Stores pre-signed URLs for images
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1); // Pagination state
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

  useEffect(() => {
    // Fetch images from r2 using db's storage path
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/download-metadata?page=${page}`);

        if (!res.ok) {
          throw new Error('Failed to fetch images metadata');
        }
        const data = await res.json();
        setImages(data.images);
        setTotalPages(data.totalPages); // Set total count of images
      } catch (error) {
        console.error('Error fetching images metadata:', error);
        setError('Failed to fetch images metadata');
      } finally {
        setLoading(false);
      }
    };

    // generate pre-signed url for each image

    fetchImages();
  }, [page]);

  useEffect(() => {
    // fucntion to get presigned URL for each image
    const fetchPreSignedUrls = async () => {
      const urls = await Promise.all(
        images.map(async (image) => {
          const res = await fetch(`/api/download?storage_path=${image.storage_path}`);
          const data = await res.json();
          return {
            ...image, // Include image metadata
            presignedUrl: data.url, // add presigned url to image metadata
          };
        })
      );
      setImageUrls(urls); // Set the pre-signed URLs for images
    };
    if (images.length > 0) {
      fetchPreSignedUrls(); // Fetch pre-signed URLs when images are available
    }
  }, [images]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1); // Go to the next page
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1); // Go to the previous page
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
        {imageUrls.map((img) => (
          <div key={img.id} className="border rounded shadow-sm">
            <img
              src={img.presignedUrl}
              alt={img.storage_path}
              width={300}
              height={300}
              className="object-cover w-full h-48"
            />

            <p className="text-xs truncate p-2">{img.storage_path}</p>
          </div>
        ))}
      </div>

      <div className="pagination-controls">
        <button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </button>
        <button onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </button>
        <p>
          Page {page} of {totalPages}
        </p>
      </div>
    </div>
  );
}

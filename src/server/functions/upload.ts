// Generates a pre-signed URL for uploading files to Cloudflare R2 bucket
export const getUploadPreSignedUrl = async (filename: string): Promise<string | null> => {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename }),
    });

    if (!res.ok) {
      console.error('Failed to fetch pre-signed URL');
      return null;
    }

    const { url }: { url: string } = await res.json();
    return url;
  } catch (error) {
    console.error('Error fetching pre-signed URL:', error);
    return null;
  }
};

// uploads the file to cloudflare r2 bucket using the pre-signed URL
export const uploadFileToUrl = async (url: string, file: File): Promise<boolean> => {
  try {
    const uploadRes = await fetch(url, {
      method: 'PUT',
      body: file,
    });

    return uploadRes.ok;
  } catch (error) {
    console.error('Error uploading file:', error);
    return false;
  }
};

// Uploads metadata to the database after successful upload
export const uploadMetadata = async (
  filename: string,
  size: number,
  type: string,
  userId: string,
  storagePath: string
): Promise<boolean> => {
  try {
    const res = await fetch('/api/upload-metadata', {
      // Call your metadata API
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, size, type, userId, storagePath }),
    });

    if (!res.ok) {
      console.error('Failed to upload metadata');
      return false;
    }

    const data = await res.json();
    console.log('Metadata uploaded successfully:', data);
    return true;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    return false;
  }
};

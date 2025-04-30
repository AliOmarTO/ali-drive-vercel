// Generates a pre-signed URL for uploading files to Cloudflare R2 bucket
export const getUploadPreSignedUrl = async (
  filename: string,
  size: number,
  type: string
): Promise<string | null> => {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, size, type }),
    });

    if (!res.ok) {
      const errorData = await res.json(); // This assumes the server sends a JSON body with error details
      const errorMessage = errorData?.error || 'Failed to fetch pre-signed URL';
      console.error('Failed to fetch pre-signed URL', errorMessage);
      throw new Error('Failed to fetch pre-signed URL: ' + errorMessage);
    }

    const { url }: { url: string } = await res.json();

    if (!url) {
      console.error('Missing pre-signed URL in response');
      throw new Error('Missing pre-signed URL in response');
    }

    return url;
  } catch (error) {
    console.error('Error fetching pre-signed URL:', error);
    throw new Error('Error fetching pre-signed URL:' + error);
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
    throw new Error('Error uploading file:' + error);
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
      // Handle different HTTP status codes (e.g., 409 Conflict)
      const errorMessage = (await res.text()) || 'Failed to fetch pre-signed URL';

      if (res.status === 409) {
        console.warn('Image already exists:', errorMessage);
      } else {
        console.error('Error fetching pre-signed URL:', errorMessage);
      }

      throw new Error(errorMessage); // Throw the error to handle in the calling function
    }

    const data = await res.json();
    console.log('Metadata uploaded successfully');
    return data;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw new Error('Error uploading metadata:' + error);
  }
};

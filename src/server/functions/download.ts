// gets pre signed url to download the image needed
export async function getDownloadUrl(): Promise<string | null> {
  try {
    const res = await fetch('/api/download');

    if (!res.ok) {
      console.error('Failed to get download presigned url');
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to get download URL', err);
    throw new Error('Failed to get download presigned url: ' + err);
  }
}

import { useEffect, useState } from "react";

/**
 * Turn a backend image blob (`Uint8Array`) into an object URL for rendering.
 * Returns null while there is no blob and revokes the URL on change/unmount.
 */
export function useBlobUrl(blob: Uint8Array | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob || blob.length === 0) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(
      new Blob([blob as BlobPart], { type: "image/*" }),
    );
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url;
}

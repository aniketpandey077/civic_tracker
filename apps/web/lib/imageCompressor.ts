/**
 * Client-side high-performance image compression utility using HTML Canvas.
 * Resizes heavy images/blobs down to maxDimension (default 1024px) and compresses to ~150KB JPEG format.
 */
export async function compressImage(
  input: File | Blob | string,
  maxDimension: number = 1024,
  quality: number = 0.8
): Promise<File> {
  // If running in SSR / Node.js environment, return fallback
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof Image === 'undefined') {
    if (input instanceof File) return input;
    if (input instanceof Blob) return new File([input], 'upload.jpg', { type: 'image/jpeg' });
    return new File([], 'upload.jpg', { type: 'image/jpeg' });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const objectUrl =
      typeof input === 'string'
        ? input
        : URL.createObjectURL(input);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate scale to maintain aspect ratio within maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (input instanceof File) resolve(input);
        else resolve(new File([input as Blob], 'compressed.jpg', { type: 'image/jpeg' }));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (typeof input === 'string' && input.startsWith('blob:')) {
            URL.revokeObjectURL(objectUrl);
          }

          if (blob) {
            const filename =
              input instanceof File
                ? input.name.replace(/\.[^/.]+$/, '') + '_compressed.jpg'
                : 'civic_defect_compressed.jpg';

            const compressedFile = new File([blob], filename, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            if (input instanceof File) resolve(input);
            else resolve(new File([input as Blob], 'fallback.jpg', { type: 'image/jpeg' }));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = (err) => {
      console.warn('Canvas image compression failed, using original file:', err);
      if (input instanceof File) resolve(input);
      else resolve(new File([input as Blob], 'original.jpg', { type: 'image/jpeg' }));
    };

    img.src = objectUrl;
  });
}

//decreasing the size of the image
export async function compressPhoto(file: File): Promise<File> {
  const maxSize = 1280;

  // Decode the image
  const bitmap = await createImageBitmap(file);

  try {
    // Find the longest side of the image
    const longestSide = Math.max(bitmap.width, bitmap.height);

    // Calculate how much to shrink the image
    const scale = Math.min(1, maxSize / longestSide);

    // Calculate the new dimensions
    const newWidth = Math.max(1, Math.round(bitmap.width * scale));
    const newHeight = Math.max(1, Math.round(bitmap.height * scale));

    // Create a canvas for the resized image
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Unable to create image canvas');
    }

    // JPEG does not support transparency
    // Fill transparent areas with white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, newWidth, newHeight);

    // Draw the resized image
    ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);

    // Convert the canvas into a JPEG Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Image compression failed'));
          }
        },
        'image/jpeg',
        0.8,
      );
    });

    // Return the compressed image as a File
    return new File([blob], 'food-photo.jpg', { type: 'image/jpeg' });
  } finally {
    bitmap.close();
  }
}

/**
 * Mock photo upload function.
 *
 * TODO: Replace with actual upload to the
 * food-photos storage bucket when available.
 */
export async function uploadFoodPhoto(file: File): Promise<string> {
  // Create a temporary URL for the photo
  const photoUrl = URL.createObjectURL(file);

  console.log('Mock photo upload:', file.name);

  return photoUrl;
}

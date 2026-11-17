import { requireSupabase } from './supabase';

const FOOD_PHOTOS_BUCKET = 'food-photos';
const MAX_EDGE_PX = 1280;
const JPEG_QUALITY = 0.8;

/** Shrink a phone photo before upload (longest side ~1280px, JPEG). */
export async function compressPhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);

  try {
    const longestSide = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, MAX_EDGE_PX / longestSide);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not process this photo. Please try another image.');
    }

    // JPEG has no alpha; fill so transparent PNGs don't turn black.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Could not process this photo. Please try another image.'));
        },
        'image/jpeg',
        JPEG_QUALITY,
      );
    });

    return new File([blob], 'food-photo.jpg', { type: 'image/jpeg' });
  } finally {
    bitmap.close();
  }
}

/**
 * Upload a compressed food photo to the food-photos bucket.
 * Returns a public URL suitable for food_posts.photo_url.
 */
export async function uploadFoodPhoto(file: File): Promise<string> {
  const client = requireSupabase();
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    throw new Error('Sign in to upload a photo.');
  }

  const path = `${user.id}/${crypto.randomUUID()}.jpg`;
  const { error: uploadError } = await client.storage.from(FOOD_PHOTOS_BUCKET).upload(path, file, {
    contentType: 'image/jpeg',
    upsert: false,
  });

  if (uploadError) {
    throw new Error(
      uploadError.message.includes('row-level security')
        ? 'Could not upload photo. Make sure your profile exists, then try again.'
        : 'Could not upload photo. Please try again.',
    );
  }

  const { data } = client.storage.from(FOOD_PHOTOS_BUCKET).getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error('Could not get the photo URL. Please try again.');
  }

  return data.publicUrl;
}

/** Turn a stored photo_url into something an <img> can load. */
export function resolveFoodPhotoUrl(photoUrl: string | null): string | null {
  if (!photoUrl) return null;
  return photoUrl;
}

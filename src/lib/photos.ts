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

async function ensureProfile(userId: string, email: string | undefined): Promise<void> {
  if (!email) return;
  const client = requireSupabase();
  const { data } = await client.from('profiles').select('id').eq('id', userId).maybeSingle();
  if (data) return;

  const { error } = await client.from('profiles').insert({ id: userId, email });
  // Another tab / the auth trigger may have created it first.
  if (error && error.code !== '23505') {
    throw new Error('Could not set up your profile for photo upload. Please try signing out and back in.');
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

  await ensureProfile(user.id, user.email);

  const path = `${user.id}/${crypto.randomUUID()}.jpg`;
  const body = file.type === 'image/jpeg' ? file : new File([file], 'food-photo.jpg', { type: 'image/jpeg' });

  const { error: uploadError } = await client.storage.from(FOOD_PHOTOS_BUCKET).upload(path, body, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    const detail = uploadError.message || 'unknown error';
    if (/row-level security|policy/i.test(detail)) {
      throw new Error('Could not upload photo (permission denied). Sign out, sign back in, and try again.');
    }
    if (/mime|type/i.test(detail)) {
      throw new Error('That image type is not supported. Try a JPG or PNG.');
    }
    if (/size|payload|too large|maximum/i.test(detail)) {
      throw new Error('That photo is too large. Try a smaller image.');
    }
    throw new Error(`Could not upload photo: ${detail}`);
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

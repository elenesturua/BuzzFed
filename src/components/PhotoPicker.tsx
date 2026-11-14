import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { compressPhoto } from '../data/photos';

type PhotoPickerProps = {
  onPhotoChange: (file: File | null) => void;
};

function PhotoPicker({ onPhotoChange }: PhotoPickerProps) {
  // Stores the preview URL and any validation error
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keeps track of the current URL for cleanup
  const previewUrlRef = useRef<string | null>(null);

  // Handles selecting a photo

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    // Reset input so the same file can be selected again
    e.target.value = '';

    // Check that the selected file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    try {
      setError(null);

      // Compress the image before storing it
      const compressedFile = await compressPhoto(file);

      // Free the previous preview URL
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      // Create a preview from the compressed image
      const newUrl = URL.createObjectURL(compressedFile);
      previewUrlRef.current = newUrl;

      setPhotoPreview(newUrl);

      // Send the compressed file to Post.tsx
      onPhotoChange(compressedFile);
    } catch (error) {
      console.error('Photo compression failed:', error);
      setError('Could not process the photo. Please try another image.');
    }
  }

  // Handles removing the selected photo
  function removePhoto() {
    // Free the preview URL
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    // Clear the preview and error
    setPhotoPreview(null);
    setError(null);

    // Notify Post.tsx that the photo was removed
    onPhotoChange(null);
  }

  // Clean up when the component unmounts
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Add a photo of your food
      </Typography>

      {/* Photo selection button */}
      <Button variant="outlined" component="label">
        Add Photo
        <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
      </Button>

      {/* Display validation errors */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Photo preview */}
      {photoPreview && (
        <Box sx={{ mt: 2 }}>
          <Box
            component="img"
            src={photoPreview}
            alt="Preview of food to be posted"
            sx={{
              width: '100%',
              maxHeight: 300,
              objectFit: 'contain',
              borderRadius: 2,
            }}
          />

          {/* Remove photo button */}
          <Button color="error" onClick={removePhoto} sx={{ mt: 1 }}>
            Remove Photo
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default PhotoPicker;

/**
 * Uploads a food photo and returns its URL.
 *
 * TODO: Replace this mock implementation when
 * the food-photos storage bucket is available.
 */
export async function uploadFoodPhoto(file: File): Promise<string> {
  // Temporary mock upload
  const photoUrl = URL.createObjectURL(file);

  console.log('Mock photo upload:', file.name);

  return photoUrl;
}

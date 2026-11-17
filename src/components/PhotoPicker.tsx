import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { compressPhoto } from '../lib/photos';

type PhotoPickerProps = {
  onPhotoChange: (file: File | null) => void;
};

export default function PhotoPicker({ onPhotoChange }: PhotoPickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  function replacePreview(nextUrl: string | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const compressed = await compressPhoto(file);
      replacePreview(URL.createObjectURL(compressed));
      onPhotoChange(compressed);
    } catch (err) {
      replacePreview(null);
      onPhotoChange(null);
      setError(err instanceof Error ? err.message : 'Could not process the photo.');
    } finally {
      setBusy(false);
    }
  }

  function removePhoto() {
    replacePreview(null);
    setError(null);
    onPhotoChange(null);
  }

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
        Add a photo of the food
      </Typography>

      <Button variant="outlined" component="label" disabled={busy}>
        {busy ? 'Processing…' : previewUrl ? 'Change photo' : 'Add photo'}
        <input type="file" accept="image/*" hidden disabled={busy} onChange={handlePhotoChange} />
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {previewUrl && (
        <Box sx={{ mt: 2 }}>
          <Box
            component="img"
            src={previewUrl}
            alt="Preview of food to be posted"
            sx={{
              width: '100%',
              maxHeight: 300,
              objectFit: 'contain',
              borderRadius: 2,
            }}
          />
          <Button color="error" onClick={removePhoto} sx={{ mt: 1 }} disabled={busy}>
            Remove photo
          </Button>
        </Box>
      )}
    </Box>
  );
}

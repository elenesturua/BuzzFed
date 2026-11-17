import { Box } from '@mui/material';
import { resolveFoodPhotoUrl } from '../lib/photos';

type FoodPhotoProps = {
  photoUrl: string | null;
  title: string;
  height?: number;
};

export default function FoodPhoto({ photoUrl, title, height = 200 }: FoodPhotoProps) {
  const src = resolveFoodPhotoUrl(photoUrl);
  if (!src) return null;

  return (
    <Box
      component="img"
      src={src}
      alt={`Photo of ${title}`}
      loading="lazy"
      sx={{
        width: '100%',
        height,
        objectFit: 'cover',
        borderRadius: 2,
        bgcolor: 'action.hover',
      }}
    />
  );
}

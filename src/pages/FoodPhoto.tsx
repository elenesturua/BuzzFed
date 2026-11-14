import { Box } from '@mui/material';

type FoodPhotoProps = {
  photoUrl: string | null;
  title: string;
  height?: number;
};

function FoodPhoto({ photoUrl, title, height = 200 }: FoodPhotoProps) {
  // Don't display anything if there is no photo
  if (!photoUrl) {
    return null;
  }

  return (
    <Box
      component="img"
      src={photoUrl}
      alt={`Photo of ${title}`}
      loading="lazy"
      sx={{
        width: '100%',
        height: height,
        objectFit: 'cover',
        borderRadius: 2,
      }}
    />
  );
}

export default FoodPhoto;

import { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

type EmailStepProps = {
  onSubmit: (email: string) => Promise<void>;
};

export default function EmailStep({ onSubmit }: EmailStepProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    const isValid = /^[^\s@]+@gatech\.edu$/i.test(trimmedEmail);

    if (!isValid) {
      setError('Please enter a valid @gatech.edu email.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onSubmit(trimmedEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Typography variant="h5">Log in</Typography>

      <Typography>Enter your Georgia Tech email to continue.</Typography>

      <TextField
        label="Georgia Tech Email"
        type="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError('');
        }}
        error={Boolean(error)}
        helperText={error}
        fullWidth
        disabled={loading}
      />

      <Button variant="contained" type="submit" disabled={loading}>
        {loading ? 'Sending code…' : 'Send login code'}
      </Button>
    </Box>
  );
}

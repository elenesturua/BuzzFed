
import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

type EmailStepProps = {
  onSubmit: (email: string) => void;
};

export default function EmailStep({ onSubmit }: EmailStepProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    const trimmedEmail = email.trim();
    const isValid = /^[^\s@]+@gatech\.edu$/i.test(trimmedEmail);

    if (!isValid) {
      setError("Please enter a valid @gatech.edu email.");
      return;
    }

    setError("");
    onSubmit(trimmedEmail);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5">Log in</Typography>

      <Typography>
        Enter your Georgia Tech email to continue.
      </Typography>

      <TextField
        label="Georgia Tech Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError("");
        }}
        error={Boolean(error)}
        helperText={error}
        fullWidth
      />

      <Button variant="contained" onClick={handleSubmit}>
        Send login code
      </Button>
    </Box>
  );
}

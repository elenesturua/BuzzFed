
import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

type CodeStepProps = {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
};

export default function CodeStep({
  email,
  onVerify,
  onResend,
  onBack,
}: CodeStepProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleVerify() {
    if (!/^\d{6}$/.test(code)) {
      setError("Please enter a 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onVerify(code);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    setError("");

    try {
      await onResend();
      setCooldown(30);
    } catch {
      setError("Could not resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5">Verify your email</Typography>

      <Typography>
        Enter the 6-digit code sent to {email}.
      </Typography>

      <TextField
        label="Verification code"
        value={code}
        onChange={(e) => {
          setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
          setError("");
        }}
        slotProps={{
            htmlInput: {
            inputMode: "numeric",
            maxLength: 6,
            },
        }}
        error={Boolean(error)}
        helperText={error}
        fullWidth
      />
      <Typography variant="body2" color="text.secondary">
        For testing, use verification code: 123456
      </Typography>

      <Button
        variant="contained"
        onClick={handleVerify}
        disabled={loading}
      >
        Verify and log in
      </Button>

      <Button
        onClick={handleResend}
        disabled={loading || cooldown > 0}
      >
        {cooldown > 0
          ? `Resend code in ${cooldown}s`
          : "Resend code"}
      </Button>

      <Button onClick={onBack} disabled={loading}>
        Change email
      </Button>
    </Box>
  );
}

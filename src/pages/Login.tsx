
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@mui/material";

import EmailStep from "../components/login/EmailLogin";
import CodeStep from "../components/login/CodeLogin";

import {
  sendLoginCode,
  verifyLoginCode,
} from "../lib/auth";

export default function Login() {
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleEmailSubmit(newEmail: string) {
    try {
      setError("");
      await sendLoginCode(newEmail);
      setEmail(newEmail);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send code."
      );
    }
  }

  async function handleVerify(code: string) {
    if (!email) return;

    await verifyLoginCode(email, code);
    navigate("/feed", { replace: true });
  }

  async function handleResend() {
    if (!email) return;
    await sendLoginCode(email);
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6, px: 2 }}>
      {email === null ? (
        <EmailStep onSubmit={handleEmailSubmit} />
      ) : (
        <CodeStep
          email={email}
          onVerify={handleVerify}
          onResend={handleResend}
          onBack={() => setEmail(null)}
        />
      )}

      {error && <p role="alert">{error}</p>}
    </Container>
  );
}

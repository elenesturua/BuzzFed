import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';

import EmailStep from '../components/login/EmailStep';
import CodeStep from '../components/login/CodeStep';

import { sendLoginCode, verifyLoginCode } from '../lib/auth';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  async function handleEmailSubmit(newEmail: string) {
    await sendLoginCode(newEmail);
    setEmail(newEmail);
  }

  async function handleVerify(code: string) {
    if (!email) return;

    await verifyLoginCode(email, code);
    await refresh();
    navigate('/feed', { replace: true });
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
    </Container>
  );
}

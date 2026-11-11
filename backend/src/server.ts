import app from './app.js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in backend/.env.');

  process.exit(1);
}

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
# BuzzFed

Find leftover free food after Georgia Tech campus events. Built with React, TypeScript, Vite, MUI, and Supabase.

## What you need installed

- **Node.js 24 (LTS)** from [nodejs.org](https://nodejs.org/en/download). Check with `node -v` (should start with `v24`).
- **Git** from [git-scm.com](https://git-scm.com/downloads). Check with `git --version`.
- **Prettier extension** in VS Code or Cursor (optional, formats on save).

## Setup

```bash
git clone <GITHUB-REPO-URL>
cd BuzzFed
npm install
```

`npm install` installs everything the project uses: React, MUI, React Router, Supabase, Prettier, and the rest. You do not need to install any of them separately.

## Your `.env` file

The app reads its keys from a file named `.env`. Everyone makes their own.

1. Copy `.env.example` to a new file named `.env` in the same folder:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell: `Copy-Item .env.example .env`

2. Fill in the values after we get them.

`.env` is in `.gitignore`, so it is never pushed. Only `.env.example` (with empty values) is in the repo.

Anything starting with `VITE_` ends up in the browser, where anyone can see it. Never put the Supabase `service_role` key in `.env`.

## Run the app

```bash
npm run dev
```

Open `http://localhost:5173`. If you change `.env`, stop the server (`Ctrl+C`) and run it again.

## Before every commit

```bash
npm run format
```

This runs Prettier so everyone's code looks the same. Then commit.

## Scripts

| Command           | What it does                            |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Start the local dev server              |
| `npm run format`  | Format all files with Prettier          |
| `npm run lint`    | Check the code for problems (Oxlint)    |
| `npm run build`   | Type-check and build the production app |
| `npm run preview` | Preview the production build            |

## Contributing

Never push to `main`. Make a branch, open a pull request, and get 1 approval. You can write on Discord as well.

---
name: testing-cvpro-ai
description: Test CVPro AI end-to-end. Use when verifying UI, auth forms, validation, or Supabase-dependent features.
---

# Testing CVPro AI

## Prerequisites

- Node.js and npm installed
- `.env` file at repo root with at minimum:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_GEMINI_API_KEY` (optional for AI features)
  - `VITE_GROQ_API_KEY` (optional for AI features)
  - `VITE_APP_NAME=CVPro AI`
  - `VITE_APP_URL=http://localhost:5173`

## Devin Secrets Needed

- `VITE_SUPABASE_URL` — Supabase project URL (for full auth/DB testing)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key (for full auth/DB testing)
- `VITE_GEMINI_API_KEY` — Google Gemini API key (for AI feature testing)
- `VITE_GROQ_API_KEY` — Groq API key (for AI fallback testing)

## Running the Dev Server

```bash
cd /home/ubuntu/repos/cvpro-ai
npm install
npm run dev
```

Vite may pick a different port if 5173 is in use — check the terminal output for the actual URL.

## What Can Be Tested Without Real Supabase

With placeholder env vars, the app still loads and renders. These are testable:

1. **Landing page** — nav bar, hero section, 3 feature cards, CTA button
2. **Login form** — centered layout, email/password fields, "Registar-se" navigation link
3. **Register form** — centered layout, 4 fields (Nome, Email, Senha, Confirmar Senha), "Entrar" link
4. **Register validation** (client-side):
   - Empty name: blocked by HTML5 `required` attribute
   - Password < 6 chars: shows "A senha deve ter pelo menos 6 caracteres"
   - Password mismatch: shows "As senhas não coincidem"
5. **Navigation** — Login ↔ Register via bottom links, Landing → Login/Register via nav buttons
6. **netlify.toml** — verify valid TOML with `cat netlify.toml`
7. **Build** — `npm run build` should succeed

## What Requires Real Supabase Credentials

- Actual login/register (auth API calls)
- Dashboard (list CVs, create new CV)
- Editor (load CV data, save, AI suggestions)
- Auth state listener (session expiry)
- Rate limiting (ai_usage table)
- CV user-scoping

## App Architecture Notes

- **Routing**: Manual state-based routing in `App.jsx` (no react-router). Pages: `landing`, `login`, `register`, `dashboard`, `editor`
- **State**: Zustand store (`cvStore.js`) for CV editor data
- **Auth**: Supabase Auth with `onAuthStateChange` listener
- **AI**: Gemini 2.0 Flash primary, Groq Llama 3.3 70B fallback. Both called client-side (keys in frontend bundle)
- **Language**: Portuguese (PT) UI throughout

## Common Issues

- Port conflicts: Vite auto-increments port. Check terminal output.
- Supabase placeholder values won't crash the app (env vars exist), but auth calls will fail with network errors — this is expected.
- The app uses `alert()` was replaced with inline messages in Editor — verify inline `<p>` messages appear instead of browser dialogs.

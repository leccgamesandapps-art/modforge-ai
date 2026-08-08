# ModForge AI

**Instant advanced Minecraft mods from text.**

Create complete Resource Packs (RP) + Behavior Packs (BP) packaged as `.mcaddon` with AI.

## Features
- Text-to-mod generation (blocks, items, mobs, armor, recipes, textures, models)
- Full RP + BP structure
- Downloadable `.mcaddon`
- Real Google Sign-In (Auth.js / NextAuth v5)
- Google Drive scope for future cloud saves
- Local username/password fallback
- Bottom nav: Home / Create / Projects
- Top nav: Search, Profile, Settings

## Environment Variables (required for Google login)

```
AUTH_SECRET=your-random-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

## Stack
- Next.js 16 + React 19 + Tailwind CSS 4
- Auth.js (next-auth v5)
- JSZip packaging

## Local
```bash
npm install
npm run dev
```

## Deploy
Connected to Vercel. Set the three env vars above then redeploy.

---
Built for the AI Mod Maker vision.

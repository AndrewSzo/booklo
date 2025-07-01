# Cloudflare Deployment Guide

## Option 1: OpenNext Cloudflare (Recommended)

This is the modern approach using `@opennextjs/cloudflare`.

### Local Development & Deployment

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build for Cloudflare:**
   ```bash
   npm run pages:build
   ```

3. **Preview locally:**
   ```bash
   npm run preview
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

### Cloudflare Dashboard Settings

**For Git integration:**
- **Build command:** `npm run pages:build`
- **Deploy command:** `wrangler pages deploy`
- **Build output directory:** `.vercel/output/static`

**Environment Variables:**
- Add `NODE_VERSION` = `18` or higher
- Add your application environment variables (database URLs, API keys, etc.)

**Compatibility Settings:**
- Go to Settings > Functions > Compatibility Flags
- Add `nodejs_compat` flag for both production and preview
- Set Compatibility Date to `2025-01-01` or later

## Option 2: Traditional next-on-pages

Alternative approach using `@cloudflare/next-on-pages`.

### Local Development & Deployment

1. **Build for Cloudflare:**
   ```bash
   npm run pages:build:traditional
   ```

2. **Preview locally:**
   ```bash
   npm run preview:traditional
   ```

### Cloudflare Dashboard Settings

**For Git integration:**
- **Build command:** `npx @cloudflare/next-on-pages@1`
- **Deploy command:** Leave empty or `echo "Deploy completed"`
- **Build output directory:** `.vercel/output/static`

## Troubleshooting

### Common Issues:

1. **"Missing entry-point" error:**
   - Use the correct build commands above
   - Don't use `npx wrangler deploy` alone

2. **"Invalid request body" in Cloudflare Dashboard:**
   - Try leaving Deploy command empty
   - Or use `echo "Deploy completed"`

3. **Build errors:**
   - Ensure `NODE_VERSION` is set to 18+
   - Add `nodejs_compat` compatibility flag

### Environment Variables

Make sure to set these in Cloudflare Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Any other environment variables your app needs 
# Cloudflare Deployment Guide

## Option 1: OpenNext Cloudflare (Recommended)

This is the modern approach using `@opennextjs/cloudflare` v1.3.1 and `wrangler` v4.

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
- Add `nodejs_compat_populate_process_env` flag for both production and preview
- Set Compatibility Date to `2025-01-01` or later

## Option 2: Traditional next-on-pages (Fallback)

If Option 1 fails, use this traditional approach.

### Cloudflare Dashboard Settings

**For Git integration:**
- **Build command:** `npx @cloudflare/next-on-pages@1`
- **Deploy command:** Leave empty or `echo "Deploy completed"`
- **Build output directory:** `.vercel/output/static`

## Option 3: Simple Next.js Build (Last Resort)

If both above options fail:

### Cloudflare Dashboard Settings

**For Git integration:**
- **Build command:** `npm run build`
- **Deploy command:** Leave empty
- **Build output directory:** `.next`

## Troubleshooting

### Common Issues:

1. **Dependency conflicts:**
   - The project includes `.npmrc` with `legacy-peer-deps=true`
   - This should resolve wrangler version conflicts

2. **"Missing entry-point" error:**
   - Use the correct build commands above
   - Don't use `npx wrangler deploy` alone

3. **"Invalid request body" in Cloudflare Dashboard:**
   - Try leaving Deploy command empty
   - Or use `echo "Deploy completed"`

4. **Build errors:**
   - Ensure `NODE_VERSION` is set to 18+
   - Add `nodejs_compat_populate_process_env` compatibility flag

### Environment Variables

Make sure to set these in Cloudflare Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `OPENAI_API_KEY` (if using AI features)
- `NODE_VERSION` = `18` 
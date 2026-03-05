# Deploying to Cloudflare Pages

Live site: https://avail-new-website.pages.dev/

## Setup (One-Time)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Workers & Pages** → **Create** → **Pages** tab
3. Click **Connect to Git** and authorize the `anurag-arjun` GitHub account
4. Select the **avail-new-website** repository
5. Configure build settings:
   - **Production branch:** `cloudflare-deploy`
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `.`
6. Click **Save and Deploy**

## How Deploys Work

Every push to the `cloudflare-deploy` branch triggers an automatic deployment. No build step is needed — Cloudflare serves the static files directly.

Preview deployments are created for pushes to other branches and pull requests.

## Project Structure

```
├── *.html                 # Page files served from root
├── css/                   # Stylesheets
├── fonts/                 # Font files (woff2)
├── images/                # Image assets
├── videos/                # Video assets
├── scripts/               # JavaScript
├── _headers               # Cloudflare cache headers config
├── _redirects             # Clean URL rewrites (e.g. /nexus → /nexus.html)
├── manifest.json          # Web app manifest
└── .gitignore             # Excludes dev artifacts from deploy
```

## Cloudflare-Specific Files

### `_headers`

Controls caching behavior. HTML files are set to `no-cache` for instant updates; static assets (fonts, images, CSS, JS, videos) are cached for 1 year with `immutable`.

### `_redirects`

Maps clean URLs to HTML files so `/nexus` serves `nexus.html`, `/da` serves `da.html`, etc. Uses `200` rewrites (not 301 redirects) so the URL stays clean.

## Custom Domain

To use a custom domain instead of `*.pages.dev`:

1. Go to the project in Cloudflare Dashboard → **Custom domains**
2. Add your domain (e.g. `availproject.org`)
3. Follow the DNS configuration prompts

## Manual Deploy via CLI

If you need to deploy without pushing to Git:

```bash
# Install wrangler
npm install -g wrangler

# Authenticate
wrangler login

# Deploy
wrangler pages deploy . --project-name=avail-new-website
```

## Rollback

In the Cloudflare Dashboard → **Workers & Pages** → **avail-new-website** → **Deployments**, click on any previous deployment and select **Rollback to this deployment**.

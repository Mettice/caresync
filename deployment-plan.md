# CareSync Integration Deployment Plan

This document outlines the deployment strategy for integrating the CareSync main application with the CareSync landing page.

## Overview

We're keeping both applications separate but linking them together:
- Landing page (`caresync-ai-landing`) will be deployed at `/landing` or as the main domain root
- Main application (`frontend`) will be deployed at `/app`

## Deployment Options

### Option 1: Using Nginx as a Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Main landing page
    location / {
        proxy_pass http://localhost:3000;  # Landing page running on port 3000
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Main application
    location /app {
        proxy_pass http://localhost:5000;  # Main app running on port 5000
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Alternative: Landing page at /landing
    location /landing {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 2: Using a Reverse Proxy with Base URLs

Both applications need to be built with the appropriate base URLs:

1. For the landing page (TypeScript/Vite):
   ```bash
   # If deploying at the root
   npm run build

   # If deploying at /landing
   VITE_BASE_URL=/landing npm run build
   ```

2. For the main app (JavaScript/Vite):
   ```bash
   # Deploy at /app
   VITE_BASE_URL=/app npm run build
   ```

Update the Vite configs to support base URL:

- For `frontend/vite.config.js`:
  ```javascript
  export default defineConfig({
    base: process.env.VITE_BASE_URL || '/app/',
    // other config options...
  })
  ```

- For `caresync-ai-landing/vite.config.ts`:
  ```typescript
  export default defineConfig({
    base: process.env.VITE_BASE_URL || '/',
    // other config options...
  })
  ```

## Development Setup

For local development, you can run both apps on different ports:

```bash
# Terminal 1 - Run landing page
cd caresync-ai-landing
npm run dev -- --port 3000

# Terminal 2 - Run main app
cd frontend
npm run dev -- --port 5000
```

## Next Steps

1. Update the URL links in both applications as implemented
2. Configure your build process for production deployment
3. Set up the web server with the appropriate routing rules
4. Deploy both applications according to the selected strategy 
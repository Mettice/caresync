# CareSync Integration Guide

This repository contains two separate applications that work together:

1. **Main Application** (frontend) - The core CareSync application with dashboard, reminders, forms, and uploads
2. **Landing Page** (caresync-ai-landing) - A marketing-focused landing page built with React and TypeScript

## Integration Approach

We've chosen to keep both applications separate but linked to each other. This approach has several benefits:

- Each application can be developed and deployed independently
- The landing page can use more modern tooling (TypeScript, shadcn/ui)
- The main application can remain simple and focused on functionality
- Both can be improved incrementally without affecting each other

## Navigation Between Applications

- The landing page has a "Dashboard" link in the navigation that points to the main application
- The main application has a "Landing Page" link in the navigation that takes users back to the landing page

## Development

To run both applications in development mode:

```bash
# Make the script executable
chmod +x dev.sh

# Run the script
./dev.sh
```

This will start:
- Landing page at http://localhost:8080
- Main application at http://localhost:3000

You can also run each application separately:

```bash
# Run the landing page
cd caresync-ai-landing
npm run dev

# Run the main application
cd frontend
npm run dev
```

## Deployment

For deployment, see the detailed instructions in `deployment-plan.md`. The basic approach is:

1. Build both applications with the appropriate base URLs
2. Set up a web server (like Nginx) to route requests correctly:
   - `/app` routes to the main application
   - `/` or `/landing` routes to the landing page

## Future Improvements

This integration approach allows for gradual improvements:

1. Gradually adopt TypeScript in the main application
2. Incrementally add shadcn/ui components to the main application
3. Share design tokens and styles between both applications
4. Eventually merge both codebases if desired 
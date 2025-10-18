# SSR Setup Documentation

## Overview
This project now has Server-Side Rendering (SSR) enabled using Vite and Express.

## Project Structure

```
├── src/
│   ├── entry-client.tsx     # Client-side hydration entry point
│   ├── entry-server.tsx     # Server-side rendering entry point
│   ├── main.tsx            # Original development entry (still used for dev mode)
│   └── ...
├── server.ts               # Express server for SSR
├── vite.config.ts         # Updated Vite configuration for SSR
├── index.html             # Updated HTML template with app div
└── package.json           # Updated with SSR scripts
```

## Key Files

### `src/entry-client.tsx`
- Handles client-side hydration using `hydrateRoot()`
- Takes over from server-rendered HTML on the client

### `src/entry-server.tsx`
- Server-side rendering using `renderToString()`
- Uses `StaticRouter` for route handling on the server

### `server.ts`
- Express server that handles SSR
- Serves static files in production
- Integrates with Vite dev server in development
- Replaces HTML placeholder with rendered content

### `vite.config.ts`
- Updated to support SSR builds
- Configured with proper entry points
- Handles dependency externalization

## Scripts

### Development
```bash
npm run dev          # Regular Vite development server (no SSR)
npm run dev:ssr      # SSR development server with hot reloading
```

### Production
```bash
npm run build        # Build both client and server bundles
npm run build:client # Build client bundle only
npm run build:server # Build server bundle only  
npm run start        # Start production SSR server
```

## Build Process

1. **Client Build** (`npm run build:client`):
   - Builds the client-side bundle from `entry-client.tsx`
   - Output: `dist/client/`

2. **Server Build** (`npm run build:server`):
   - Builds the SSR bundle from `entry-server.tsx` 
   - Output: `dist/server/`

3. **Copy Assets** (`npm run build:copy`):
   - Copies `index.html` to `dist/client/`

## Usage Instructions

### Development with SSR
```bash
npm run dev:ssr
```
- Starts Express server with Vite integration
- Hot reloading enabled
- Server running at http://localhost:3000

### Production Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## SSR Benefits

1. **SEO Improvement**: HTML is rendered on the server
2. **Faster Initial Load**: Users see content immediately
3. **Better Performance**: Reduced Time to First Paint
4. **Accessibility**: Works without JavaScript enabled

## Technical Details

### Client-Side Hydration
The app uses `hydrateRoot()` to attach React event handlers to the server-rendered HTML, making it interactive.

### Static Routing
Server-side uses `StaticRouter` to handle routing, while client-side uses `BrowserRouter`.

### Asset Handling
Static assets are served from `dist/client` in production, while Vite handles them in development.

## Troubleshooting

### Common Issues

1. **Hydration Mismatch**: Ensure server and client render identical HTML
2. **Missing Dependencies**: All React dependencies are bundled for SSR
3. **Routing Issues**: StaticRouter location must match request URL

### Development vs Production
- Development uses Vite's SSR capabilities with HMR
- Production uses pre-built bundles for optimal performance

## Next Steps

1. Consider implementing streaming SSR with `renderToPipeableStream()` for better performance
2. Add meta tag management for SEO (using libraries like `react-helmet`)
3. Implement caching strategies for better server performance
4. Consider adding service worker for offline functionality
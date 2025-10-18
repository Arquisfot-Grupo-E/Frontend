// server.ts
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import serveStatic from 'serve-static';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

async function createServer() {
  const app = express();

  // Use compression middleware
  app.use(compression());

  let vite: any;
  if (!isProduction) {
    // Import vite in development mode
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom']
      }
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist/client in production, but not HTML files
    app.use('/', serveStatic(path.resolve(__dirname, 'dist/client'), {
      index: false, // Don't serve index.html automatically
    }));
  }

  // Handle SSR
  app.use(async (req, res, next) => {
    try {
      const url = req.originalUrl;
      let template: string;
      let render: any;

      if (!isProduction) {
        // Development mode - read template and transform with Vite
        template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8',
        );
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
      } else {
        // Production mode - use pre-built files
        template = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8',
        );
        const serverModule = await import(
          path.resolve(__dirname, 'dist/server/entry-server.js')
        );
        render = serverModule.render;
      }

      // Render the app HTML
      const { html: appHtml } = await render(url);

      // Replace the app placeholder with the rendered HTML
      const html = template.replace(`<div id="app"></div>`, `<div id="app">${appHtml}</div>`);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });

  return app;
}

const PORT = process.env.PORT || 3000;

createServer().then((app) => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
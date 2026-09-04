import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        // Kept as "build" (not Vite's default "dist") so vercel.json's distDir and
        // the express.static paths in app.js keep working unchanged.
        outDir: 'build',
        sourcemap: false
    },
    server: {
        // The API server's default CORS allowlist is http://localhost:3000.
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
        // threads start much faster than forks on Windows; CSS imports stay stubbed
        // (jsdom parsing Bootstrap's stylesheet is slow and buys the tests nothing).
        pool: 'threads'
    }
});

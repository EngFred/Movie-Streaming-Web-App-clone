import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // Keep your existing plugins here

  build: { // Add this 'build' section
    chunkSizeWarningLimit: 1000, // Optional: Adjust this value as needed (in KB)
  },

  preview: { // Add this 'preview' section
    host: '0.0.0.0', // Essential for Render to access your app
    port: 10000,     // A default port, Render's $PORT will override this
    strictPort: true, // Will fail if the port is already in use
    allowedHosts: [ // List the hostnames your app will be served from
      'netflix-clone-smut.onrender.com', // **IMPORTANT: Your Render domain**
      // Add other hosts like 'localhost' if you test 'npm run preview' locally
    ],
  },
})
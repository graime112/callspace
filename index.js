// Entry point for Railway deployment
// This file ensures proper module resolution

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run the server
import('./server/server.js').catch(console.error);

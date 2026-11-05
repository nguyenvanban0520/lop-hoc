import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.ENGLISH_ONLY = '1';
process.env.PORT = '3007';
process.env.DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data-english');
await import('./server');

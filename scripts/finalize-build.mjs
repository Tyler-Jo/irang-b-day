import { readFile, writeFile } from 'node:fs/promises';

// Use Node so the build works with both macOS and Linux.
const path = new URL('../dist/server/wrangler.json', import.meta.url);
const config = await readFile(path, 'utf8');
await writeFile(path, config.replaceAll('00000000-0000-4000-8000-000000000000', 'ff4189de-7803-4c58-96a3-925a19da4ef2'));

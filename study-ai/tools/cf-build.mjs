// Comando de compilação do Cloudflare (wrangler.jsonc → build.command).
// Nos testes locais (STUDY_AI_SKIP_BUILD=1) usa a pasta dist/ que já existe.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

if (process.env.STUDY_AI_SKIP_BUILD === '1') fs.mkdirSync('dist', { recursive: true });
else execSync('npm run build', { stdio: 'inherit' });

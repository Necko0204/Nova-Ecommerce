import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const envPath = resolve(root, '.env.local');
const outputPath = resolve(root, 'apps/admin/src/environments/environment.local.ts');
const values = new Map();

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) values.set(match[1], match[2].replace(/^['"]|['"]$/g, ''));
  }
}

const url = values.get('NG_APP_SUPABASE_URL') ?? 'http://127.0.0.1:55321';
const key = values.get('NG_APP_SUPABASE_ANON_KEY') ?? 'local-development-placeholder';
const source = `// Generated from .env.local. Do not commit this file.\nexport const environment = {\n  production: false,\n  supabaseUrl: ${JSON.stringify(url)},\n  supabaseAnonKey: ${JSON.stringify(key)},\n};\n`;
writeFileSync(outputPath, source, 'utf8');

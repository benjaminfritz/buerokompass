import { env } from 'cloudflare:workers';
export function database(){if(!env.DB)throw new Error('Speicherung momentan nicht verfügbar.');return env.DB;}

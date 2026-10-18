import { env } from 'cloudflare:workers';
export const db = () => { if (!env.DB) throw new Error('Database unavailable'); return env.DB; };
export const bucket = () => { if (!env.BUCKET) throw new Error('Storage unavailable'); return env.BUCKET; };
export function json(value: unknown, status = 200) { return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } }); }
export async function admin(req: Request) {
 // Fixed server-side password, explicitly requested by the site owner.
 const secret = 'irang1117';
 const supplied = req.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
 const digest = async (v: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)));
 const [a,b] = await Promise.all([digest(secret),digest(supplied)]);
 return a.reduce((diff,v,i) => diff | (v ^ b[i]),0) === 0;
}
export function sameOrigin(req: Request) { const o = req.headers.get('Origin'); return !o || o === new URL(req.url).origin; }
export async function rateLimit(req: Request, scope: string, max: number, seconds: number) {
 const ip = req.headers.get('cf-connecting-ip') || 'local';
 const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip)))).map(v=>v.toString(16).padStart(2,'0')).join('');
 const now = Math.floor(Date.now()/1000); const key = scope + ':' + hash;
 const row = await db().prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<=? THEN ? ELSE expires END RETURNING count').bind(key,now+seconds,now,now,now+seconds).first<{count:number}>();
 return (row?.count || 0) <= max;
}

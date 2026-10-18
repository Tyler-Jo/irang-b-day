import { db, json, admin, sameOrigin, rateLimit } from '@/lib/server';
import { defaults } from '@/lib/invitation';
export async function GET(req: Request) {
 if (!await rateLimit(req,'login',30,300)) return json({error:'잠시 후 다시 시도해 주세요.'},429);
 return await admin(req) ? json({ok:true}) : json({error:'관리자 비밀번호를 확인해 주세요.'},401);
}
export async function PUT(req: Request) {
 if (!sameOrigin(req) || !await admin(req)) return json({error:'관리자 로그인이 필요합니다.'},401);
 let data: Record<string,unknown>; try { data = await req.json() as Record<string,unknown>; if (!data || typeof data !== 'object') throw Error(); } catch { return json({error:'잘못된 요청입니다.'},400); }
 const value: Record<string,string> = {};
 for (const key of Object.keys(defaults)) { if (typeof data[key] !== 'string' || data[key].length > (key === 'greeting' ? 2000 : 400)) return json({error:'입력 내용을 확인해 주세요.'},400); value[key] = data[key].trim(); }
 if (!value.name || !value.venue || !/^\d{4}-\d{2}-\d{2}$/.test(value.date) || !Number.isFinite(Date.parse(value.date+'T'+value.time+':00+09:00')) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time)) return json({error:'이름, 장소, 날짜와 시간을 확인해 주세요.'},400);
 if(value.heroId && !await db().prepare('SELECT id FROM photos WHERE id=?').bind(value.heroId).first()) return json({error:'대표 사진을 다시 선택해 주세요.'},400);
 await db().prepare('INSERT INTO settings (id,value) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').bind(JSON.stringify(value)).run();
 return json({ok:true});
}

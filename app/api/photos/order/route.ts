import { admin, db, json, sameOrigin } from '@/lib/server';

export async function PUT(req: Request) {
 if (!sameOrigin(req) || !await admin(req)) return json({ error: '관리자 로그인이 필요합니다.' }, 401);
 let body: unknown;
 try { body = await req.json(); } catch { return json({ error: '사진 순서를 확인해 주세요.' }, 400); }
 const ids = (body as { ids?: unknown } | null)?.ids;
 if (!Array.isArray(ids) || ids.length > 60 || ids.some(id => typeof id !== 'string') || new Set(ids).size !== ids.length) {
  return json({ error: '사진 순서를 확인해 주세요.' }, 400);
 }
 const database = db();
 const current = await database.prepare('SELECT id FROM photos').all<{ id: string }>();
 if (current.results.length !== ids.length || current.results.some(photo => !ids.includes(photo.id))) {
  return json({ error: '사진 목록이 변경되었습니다. 새로고침 후 다시 정렬해 주세요.' }, 409);
 }
 if (ids.length) {
  // A single statement makes the reorder atomic; membership is checked again at write time.
  const placeholders = ids.map(() => '?').join(',');
  const result = await database.prepare(`UPDATE photos SET sort_order = CASE id ${ids.map(() => 'WHEN ? THEN ?').join(' ')} END WHERE (SELECT count(*) FROM photos) = ? AND (SELECT count(*) FROM photos WHERE id IN (${placeholders})) = ?`)
   .bind(...ids.flatMap((id, index) => [id, index]), ids.length, ...ids, ids.length).run();
  if (result.meta.changes !== ids.length) return json({ error: '사진 목록이 변경되었습니다. 새로고침 후 다시 정렬해 주세요.' }, 409);
 }
 return json({ ok: true });
}

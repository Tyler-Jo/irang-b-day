import { db, json } from '@/lib/server';
import { defaults } from '@/lib/invitation';
export async function GET() {
 const [s,p,c] = await Promise.all([db().prepare('SELECT value FROM settings WHERE id=1').first<{value:string}>(),db().prepare('SELECT * FROM photos ORDER BY sort_order ASC, created_at DESC, id ASC').all(),db().prepare('SELECT * FROM comments ORDER BY created_at DESC LIMIT 200').all()]);
 return json({ settings: {...defaults,...(s ? JSON.parse(s.value) : {})}, photos:p.results, comments:c.results });
}

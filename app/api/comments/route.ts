import { db,json,admin,sameOrigin,rateLimit } from '@/lib/server';
export async function POST(req:Request) {
 if(!sameOrigin(req)) return json({error:'잘못된 요청입니다.'},403);
 let data: Record<string,unknown>; try { data=await req.json() as Record<string,unknown>; if (!data || typeof data !== 'object') throw Error(); } catch { return json({error:'입력 내용을 확인해 주세요.'},400); }
 const {name,message,website}=data;
 if(website || typeof name!=='string' || typeof message!=='string' || !name.trim() || name.length>30 || !message.trim() || message.length>500) return json({error:'이름(30자 이하)과 축하 메시지(500자 이하)를 입력해 주세요.'},400);
 if(!await rateLimit(req,'comment',5,300)) return json({error:'메시지를 많이 남겨주셨어요. 5분 후 다시 시도해 주세요.'},429);
 await db().prepare('INSERT INTO comments (id,name,message,created_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(),name.trim(),message.trim(),new Date().toISOString()).run();
 return json({ok:true},201);
}
export async function DELETE(req:Request) {
 if(!sameOrigin(req)||!await admin(req)) return json({error:'관리자 로그인이 필요합니다.'},401);
 const id=new URL(req.url).searchParams.get('id');
 if(!id) return json({error:'댓글을 선택해 주세요.'},400);
 await db().prepare('DELETE FROM comments WHERE id=?').bind(id).run(); return json({ok:true});
}

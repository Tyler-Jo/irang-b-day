import { db,bucket,json,admin,sameOrigin } from '@/lib/server';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}) {
 const {id}=await params; if(!/^[a-f0-9-]{36}$/.test(id)) return new Response(null,{status:404});
 const object=await bucket().get(id); if(!object) return new Response(null,{status:404});
 return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType||'image/jpeg','Cache-Control':'private, max-age=3600','X-Content-Type-Options':'nosniff'}});
}
export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}) {
 if(!sameOrigin(req)||!await admin(req)) return json({error:'관리자 로그인이 필요합니다.'},401);
 const {id}=await params;
 await db().batch([db().prepare('DELETE FROM photos WHERE id=?').bind(id),db().prepare("UPDATE settings SET value=json_set(value,'$.heroId','') WHERE json_extract(value,'$.heroId')=?").bind(id)]);
 await bucket().delete(id);return json({ok:true});
}

import { db,bucket,json,admin,sameOrigin } from '@/lib/server';
export async function POST(req:Request) {
 if(!sameOrigin(req)||!await admin(req)) return json({error:'관리자 로그인이 필요합니다.'},401);
 if(Number(req.headers.get('content-length'))>9*1024*1024) return json({error:'사진은 8MB 이하로 올려 주세요.'},413);
 const form=await req.formData(); const file=form.get('file'); const caption=String(form.get('caption')||'이랑이의 소중한 순간').slice(0,100);
 if(!(file instanceof File) || !file.size || file.size>8*1024*1024) return json({error:'8MB 이하의 사진을 선택해 주세요.'},400);
 const bytes=new Uint8Array(await file.arrayBuffer());
 const mime=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71?'image/png':String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'?'image/webp':null;
 if(!mime) return json({error:'JPG, PNG, WebP 사진만 업로드할 수 있습니다.'},400);
 const count=await db().prepare('SELECT count(*) AS n FROM photos').first<{n:number}>();
 if((count?.n||0)>=60) return json({error:'사진은 최대 60장까지 올릴 수 있습니다.'},400);
 const id=crypto.randomUUID(); await bucket().put(id,bytes,{httpMetadata:{contentType:mime}});
 try { await db().prepare('INSERT INTO photos (id,caption,created_at,sort_order) SELECT ?,?,?,COALESCE(MAX(sort_order),-1)+1 FROM photos').bind(id,caption,new Date().toISOString()).run(); } catch(e) { await bucket().delete(id); throw e; }
 return json({id},201);
}

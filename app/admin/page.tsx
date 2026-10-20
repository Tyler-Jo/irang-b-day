'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { defaults, type Settings, type Photo, type Comment } from '@/lib/invitation';
export default function Admin(){
 const [selectedFiles,setSelectedFiles]=useState<File[]>([]),[uploadProgress,setUploadProgress]=useState(''),[uploadErrors,setUploadErrors]=useState<string[]>([]);
 const [key,setKey]=useState(''),[logged,setLogged]=useState(false),[tab,setTab]=useState('info'),[s,setS]=useState<Settings>(defaults),[photos,setPhotos]=useState<Photo[]>([]),[comments,setComments]=useState<Comment[]>([]),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false);
 async function request(url:string,options:RequestInit={}){const r=await fetch(url,{...options,headers:{...options.headers,Authorization:'Bearer '+key}});let d: {error?:string;settings:Settings;photos:Photo[];comments:Comment[]};try{d=await r.json() as typeof d}catch{throw Error('서버에 연결하지 못했습니다. 다시 시도해 주세요.')}if(!r.ok)throw Error(d.error||'요청에 실패했습니다.');return d;}
 async function load(){const d=await request('/api/data');setS(d.settings);setPhotos(d.photos);setComments(d.comments);setLoaded(true);}
 async function action(fn:()=>Promise<void>){setBusy(true);setStatus('');try{await fn()}catch(e){setStatus(e instanceof Error?e.message:'다시 시도해 주세요.')}finally{setBusy(false)}}
 async function login(e:React.FormEvent){e.preventDefault();await action(async()=>{await request('/api/admin');await load();setLogged(true)})}
 async function save(e?:React.FormEvent){e?.preventDefault();await action(async()=>{await request('/api/admin',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(s)});setStatus('초대장 정보를 저장했습니다.');})}
 async function upload(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();const form=e.currentTarget;const caption=String(new FormData(form).get('caption')||'');
  await action(async()=>{
   if(!selectedFiles.length)throw Error('사진을 선택해 주세요.');
   if(photos.length+selectedFiles.length>60)throw Error(`사진은 최대 60장까지 올릴 수 있습니다. 현재 ${60-photos.length}장을 추가할 수 있습니다.`);
   setUploadErrors([]);let uploaded=0;const failed:File[]=[];const errors:string[]=[];
   for(const [index,file] of selectedFiles.entries()){
    setUploadProgress(`${index+1} / ${selectedFiles.length} 업로드 중`);
    try{
     if(!file.size||file.size>8*1024*1024)throw Error('8MB 이하의 사진을 선택해 주세요.');
     const data=new FormData();data.append('file',file);data.append('caption',caption);
     await request('/api/photos',{method:'POST',body:data});uploaded++;
    }catch(error){failed.push(file);errors.push(`${file.name}: ${error instanceof Error?error.message:'업로드에 실패했습니다.'}`);}
   }
   setUploadProgress('');setSelectedFiles(failed);setUploadErrors(errors);
   if(!failed.length)form.reset();
   setStatus(`${uploaded}장 업로드 완료${failed.length?`, ${failed.length}장 실패. 실패한 사진만 다시 시도할 수 있습니다.`:'. 앨범 마지막에 추가했습니다.'}`);
   await load();
  });
 }
 async function movePhoto(index:number,direction:number){
  const next=[...photos];const target=index+direction;
  if(target<0||target>=next.length)return;
  [next[index],next[target]]=[next[target],next[index]];
  await action(async()=>{
   await request('/api/photos/order',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids:next.map(photo=>photo.id)})});
   setPhotos(next);setStatus('사진 순서를 저장했습니다. 초대장 앨범에 반영됩니다.');
  });
 }
 function field(k:keyof Settings,title:string,type='text'){return <label key={k}>{title}<input type={type} value={s[k]} required={['name','date','time','venue'].includes(k)} maxLength={400} onChange={e=>setS({...s,[k]:e.target.value})}/></label>}
 useEffect(()=>{const f=(e:BeforeUnloadEvent)=>{if(busy)e.preventDefault()};window.addEventListener('beforeunload',f);return()=>window.removeEventListener('beforeunload',f)},[busy]);
 if(!logged)return <main className="admin-shell"><Link className="brand" href="/">little <span>joy</span> ✳</Link><form className="admin-login" onSubmit={login}><p className="eyebrow">FOR MOM & DAD</p><h1>초대장 관리</h1><p className="muted">사진을 올리고, 이랑이의 초대장을 꾸며 주세요.</p><label>관리자 비밀번호<input type="password" autoComplete="current-password" value={key} onChange={e=>setKey(e.target.value)} required/></label><button className="primary" disabled={busy}>{busy?'확인 중…':'관리자 로그인'}</button>{status&&<p role="alert" className="admin-status">{status}</p>}</form></main>;
 return <main className="admin-shell"><header className="admin-header"><h1>이랑이의 초대장 관리</h1><div><a className="outline" href="/" target="_blank" rel="noreferrer">초대장 보기 ↗</a><button className="outline" disabled={busy} onClick={()=>{setKey('');setLogged(false);setStatus('')}}>로그아웃</button></div></header><div className="admin-tabs">{[['info','행사 정보'],['photos','사진 관리'],['comments','댓글 관리']].map(([id,label])=><button key={id} className={tab===id?'active':''} disabled={busy} onClick={()=>{setTab(id);setStatus('')}}>{label}</button>)}</div>{status&&<p role="status" className="admin-status">{status}</p>}
 {tab==='info'&&<form onSubmit={save} className="admin-form"><div className="admin-grid">{field('name','아이 이름')}{field('hosts','초대하는 분')}{field('date','행사 날짜','date')}{field('time','행사 시간','time')}{field('venue','장소 이름')}{field('room','연회장 · 층수 (선택)')}</div>{field('address','상세 주소 (선택)')}<label>초대의 글<textarea rows={7} maxLength={2000} value={s.greeting} onChange={e=>setS({...s,greeting:e.target.value})}/></label><label>주차 안내 (선택)<textarea rows={3} maxLength={400} value={s.parking} onChange={e=>setS({...s,parking:e.target.value})}/></label>{field('notice','방문객 안내 문구')}<p className="admin-hint">시간은 한국 시간 기준입니다. 저장하면 초대장에 바로 반영됩니다.</p><button className="primary" disabled={busy||!loaded}>{busy?'저장 중…':'변경 사항 저장'}</button></form>}
 {tab==='photos'&&<><form onSubmit={upload} className="admin-form"><label>새 사진 (여러 장 선택 가능)<input name="file" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={e=>{setSelectedFiles(Array.from(e.target.files||[]));setUploadErrors([])}}/></label>{selectedFiles.length>0&&<p className="admin-hint">선택한 사진 {selectedFiles.length}장: {selectedFiles.map(file=>file.name).join(", ")}</p>}<label>사진 설명 (선택한 사진에 공통 적용)<input name="caption" disabled={busy} maxLength={100} placeholder="예: 햇살처럼 환한 이랑이의 미소"/></label><p className="admin-hint">JPG · PNG · WebP / 한 장당 8MB 이하 / 최대 60장. 대표 사진은 초대장 첫 화면에, 모든 사진은 앨범에 표시됩니다.</p><button className="primary" disabled={busy||!selectedFiles.length}>{uploadProgress|| (busy?'처리 중…':`사진 ${selectedFiles.length}장 업로드`)}</button>{uploadProgress&&<p role="status">{uploadProgress}</p>}{uploadErrors.length>0&&<ul role="alert">{uploadErrors.map((error,index)=><li key={index}>{error}</li>)}</ul>}</form><p className="admin-hint">현재 {photos.length} / 60장 · 앞·뒤로 이동하면 순서가 자동 저장됩니다. 대표 사진을 지정하지 않으면 첫 번째 사진이 대표 사진이 됩니다.</p><div className="admin-photos">{photos.map((p,i)=><article key={p.id}><img src={'/api/photos/'+p.id} alt={p.caption}/><p>{i+1}. {p.caption}</p><div className="admin-actions photo-order-actions"><button className="outline" disabled={busy||i===0} aria-label={`${i+1}번 사진 앞으로 이동`} onClick={()=>movePhoto(i,-1)}>← 앞으로</button><button className="outline" disabled={busy||i===photos.length-1} aria-label={`${i+1}번 사진 뒤로 이동`} onClick={()=>movePhoto(i,1)}>뒤로 →</button></div><div className="admin-actions"><button className="outline" disabled={busy} onClick={()=>action(async()=>{await request('/api/admin',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...s,heroId:p.id})});await load();setStatus('대표 사진을 변경했습니다.')})}>{s.heroId===p.id||(!s.heroId&&i===0)?'✓ 대표 사진':'대표로 설정'}</button><button className="outline danger" disabled={busy} onClick={()=>{if(confirm('이 사진을 삭제할까요?'))action(async()=>{await request('/api/photos/'+p.id,{method:'DELETE'});await load();setStatus('사진을 삭제했습니다.')})}}>삭제</button></div></article>)}</div>{!photos.length&&<p className="admin-hint">아직 등록된 사진이 없습니다. 첫 사진을 올려 주세요.</p>}</>}
 {tab==='comments'&&<div className="admin-comments">{comments.length?comments.map(c=><article className="message" key={c.id}><div><strong>{c.name}</strong><time>{new Date(c.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</time></div><p>{c.message}</p><button className="outline danger" disabled={busy} onClick={()=>{if(confirm('이 댓글을 삭제할까요?'))action(async()=>{await request('/api/comments?id='+c.id,{method:'DELETE'});await load();setStatus('댓글을 삭제했습니다.')})}}>댓글 삭제</button></article>):<p className="admin-hint">아직 등록된 축하 메시지가 없습니다.</p>}</div>}</main>
}

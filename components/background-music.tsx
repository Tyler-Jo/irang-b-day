'use client';

import { useRef, useState } from 'react';
import { Music2, Pause, Play, X } from 'lucide-react';

export function BackgroundMusic() {
 const audioRef = useRef<HTMLAudioElement>(null);
 const [playing, setPlaying] = useState(false);
 const [pending, setPending] = useState(false);
 const [showHint, setShowHint] = useState(true);
 const [error, setError] = useState('');

 async function toggle() {
  const audio = audioRef.current;
  if (!audio || pending) return;
  if (!audio.paused) {
   audio.pause();
   return;
  }
  setError('');
  setPending(true);
  try {
   // Retry failed downloads on a new user gesture, without resetting paused music.
   if (audio.error) audio.load();
   await audio.play();
   setShowHint(false);
  } catch {
   setError('음악을 재생하지 못했어요. 재생 버튼을 다시 눌러 주세요.');
  } finally {
   setPending(false);
  }
 }

 return <aside className="bgm" aria-label="초대장 배경 음악">
  <audio ref={audioRef} src="/audio/love-parade.mp3" preload="none" loop
   onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
   onError={() => { setPlaying(false); setPending(false); setError('음악을 불러오지 못했어요. 재생 버튼을 다시 눌러 주세요.'); }}/>
  {(showHint || error) && <div className="bgm-hint">
   <button type="button" className="bgm-dismiss" aria-label="음악 안내 닫기" onClick={() => { setShowHint(false); setError(''); }}><X size={16}/></button>
   {error ? <p role="alert">{error}</p> : <><strong>음악과 함께 초대장을 만나보세요</strong><p id="bgm-instructions">아래 재생 버튼을 누르면<br/>LOVE PARADE를 들을 수 있어요.</p></>}
  </div>}
  <button type="button" className={`bgm-toggle${playing ? ' is-playing' : ''}`} onClick={toggle}
   disabled={pending} aria-label={playing ? '배경 음악 일시정지' : '배경 음악 재생'}
   aria-describedby={showHint && !error ? 'bgm-instructions' : undefined} aria-busy={pending}>
   <span className="bgm-icon">{playing ? <Pause size={17} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}</span>
   <span><small>LOVE PARADE</small><span aria-live="polite">{pending ? '음악 불러오는 중…' : playing ? '음악 일시정지' : '음악 재생'}</span></span>
   <Music2 size={16} aria-hidden="true"/>
  </button>
 </aside>;
}

'use client';

import { useEffect, useState } from 'react';

export function Countdown({ date, time, name }: { date: string; time: string; name: string }) {
  const target = Date.parse(`${date}T${time}:00+09:00`);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const interval = window.setInterval(tick, 1000);
    // Refresh immediately when returning from a background tab.
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  if (!Number.isFinite(target)) return null;
  const remaining = now === null ? null : Math.max(0, Math.ceil((target - now) / 1000));
  const started = remaining === 0;
  const parts = remaining === null ? null : [
    Math.floor(remaining / 86400),
    Math.floor(remaining / 3600) % 24,
    Math.floor(remaining / 60) % 60,
    remaining % 60,
  ];
  const labels = ['일', '시간', '분', '초'];
  const eventDay = now !== null && new Date(now + 9 * 3600000).toISOString().slice(0, 10) === date;

  return (
    <div className="countdown">
      <p className="countdown-title">{name}의 돌잔치까지</p>
      <div className="countdown-digits" role="timer" aria-live="off" aria-label={
        parts ? `돌잔치까지 ${parts.map((value, index) => `${value}${labels[index]}`).join(' ')} 남았습니다` : '남은 시간 계산 중'
      }>
        {labels.map((label, index) => (
          <div className="countdown-unit" key={label}>
            <strong>{parts ? String(parts[index]).padStart(2, '0') : '—'}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="countdown-note" role="status">
        {started ? (eventDay ? '기다리던 돌잔치가 시작되었어요. 함께 축하해 주세요!' : '첫 생일을 축하해 주셔서 감사합니다.') : '우리 함께 만날 날을 기다리고 있어요 ♡'}
      </p>
    </div>
  );
}

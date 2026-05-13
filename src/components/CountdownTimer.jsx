// src/components/CountdownTimer.jsx
import { useState, useEffect } from 'react';

/**
 * Props:
 *  targetTime  — Date | string | null  (real dispatch time from API)
 *  targetHour  — number fallback (default 18:00 today) when targetTime not set
 *  size        — 'normal' | 'large'
 */
export default function CountdownTimer({ targetTime = null, targetHour = 18, size = 'normal' }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      let target;
      if (targetTime) {
        target = new Date(targetTime);
      } else {
        target = new Date();
        target.setHours(targetHour, 0, 0, 0);
        if (target <= new Date()) target.setDate(target.getDate() + 1);
      }
      const diff = Math.max(0, target - Date.now());
      return {
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      };
    };

    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [targetTime, targetHour]);

  const pad = n => String(n).padStart(2, '0');

  if (size === 'large') {
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
        {[['Hours', timeLeft.h], ['Mins', timeLeft.m], ['Secs', timeLeft.s]].map(([label, val]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{
              background: 'var(--surface)', border: '2px solid var(--primary)',
              borderRadius: 'var(--radius)', padding: '16px 20px', minWidth: 72,
            }}>
              <div style={{ fontFamily: 'Sora', fontSize: 36, fontWeight: 800, color: 'var(--primary-btn)', lineHeight: 1 }}>
                {pad(val)}
              </div>
            </div>
            <div style={{ fontSize: 11, marginTop: 6, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span style={{
      fontFamily: 'Sora, monospace', fontWeight: 700, fontSize: 15,
      color: 'var(--orange)', background: 'var(--orange-soft)',
      padding: '3px 10px', borderRadius: 'var(--radius-full)', letterSpacing: '1px',
    }}>
      {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
    </span>
  );
}

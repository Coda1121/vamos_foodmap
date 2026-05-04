'use client';

import { useRef, useState, useEffect } from 'react';

interface Props {
  names: string[];
  onResult: (index: number) => void;
  disabled?: boolean;
}

const COLORS = [
  '#ff792c', '#ffb347', '#ff6b6b', '#ffd93d',
  '#6bcb77', '#4d96ff', '#ff6b9d', '#c77dff',
  '#ff9f1c', '#2ec4b6', '#e71d36', '#011627',
];

export default function SpinWheel({ names, onResult, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const angleRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(320);

  useEffect(() => {
    function updateSize() {
      const w = containerRef.current?.offsetWidth ?? 320;
      setSize(Math.min(w, 400));
    }
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    draw(angleRef.current);
  }, [names, size]);

  function draw(angle: number) {
    const canvas = canvasRef.current;
    if (!canvas || names.length === 0) return;
    const ctx = canvas.getContext('2d')!;
    const r = size / 2;
    const arc = (2 * Math.PI) / names.length;
    ctx.clearRect(0, 0, size, size);

    names.forEach((name, i) => {
      const start = angle + i * arc;
      const end = start + arc;

      // Sector
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.arc(r, r, r - 2, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(r, r);
      ctx.rotate(start + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      const fontSize = Math.max(10, Math.min(14, (r * 0.9) / (name.length * 0.65)));
      ctx.font = `bold ${fontSize}px 'Noto Serif TC', serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 3;
      const maxWidth = r - 28;
      const displayName = name.length > 8 ? name.slice(0, 7) + '…' : name;
      ctx.fillText(displayName, r - 14, fontSize / 3, maxWidth);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(r, r, 22, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function spin() {
    if (spinning || disabled || names.length === 0) return;
    setSpinning(true);

    const totalRotation = 2 * Math.PI * (8 + Math.random() * 5);
    const duration = 3500 + Math.random() * 500;
    const start = performance.now();
    const startAngle = angleRef.current;

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function frame(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const current = startAngle + totalRotation * easeOut(t);
      angleRef.current = current;
      draw(current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setSpinning(false);
        const arc = (2 * Math.PI) / names.length;
        // Pointer is at top (- π/2), wheel rotates clockwise
        const normalized = ((2 * Math.PI - (current % (2 * Math.PI))) % (2 * Math.PI));
        const index = Math.floor(normalized / arc) % names.length;
        onResult(index);
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  if (names.length === 0) return null;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 w-full">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Pointer */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10"
          style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '28px solid #ff792c', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
        />
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-full shadow-2xl"
          style={{ display: 'block' }}
        />
      </div>

      <button
        onClick={spin}
        disabled={spinning || disabled}
        className="px-12 py-4 rounded-2xl bg-[#ff792c] text-white font-bold text-lg tracking-wide shadow-lg hover:bg-[#e8681e] active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {spinning ? '旋轉中…' : '轉！'}
      </button>
    </div>
  );
}

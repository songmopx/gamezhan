
import React, { useState, useEffect } from 'react';

const MillisecondTicker: React.FC = () => {
  const [ms, setMs] = useState<string>('000');

  useEffect(() => {
    let frame: number;
    const update = () => {
      const now = new Date();
      setMs(now.getMilliseconds().toString().padStart(3, '0'));
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Live Entropy Seed (MS)</span>
      <div className="mono text-4xl font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
        .{ms}
      </div>
    </div>
  );
};

export default MillisecondTicker;

import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export const QRCodeDisplay = ({ qrData, onExpire, onRegenerate, size = 260 }) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!qrData || !qrData.active) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - qrData.generatedAt) / 1000);
      const remaining = Math.max(0, qrData.expiresInSeconds - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && onExpire) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [qrData, onExpire]);

  if (!qrData || !qrData.active) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/60 rounded-2xl border border-slate-800 text-center">
        <ShieldAlert className="w-12 h-12 text-slate-500 mb-3" />
        <h4 className="text-base font-semibold text-slate-300">No Active QR Session</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Select a lecture and click "Generate Live QR" to initiate secure attendance logging.
        </p>
      </div>
    );
  }

  const isExpired = timeLeft <= 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressRatio = Math.max(0, timeLeft / (qrData.expiresInSeconds || 180));

  const handleCopy = () => {
    navigator.clipboard?.writeText(qrData.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate deterministic QR-like grid from token
  const token = qrData.token || "GEC Palanpur-SAMPLE";
  const gridSize = 21;
  const cells = [];

  // Hash function to make grid visually look like authentic QR code
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Finder patterns (top-left, top-right, bottom-left)
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= gridSize - 7;
      const isBottomLeft = r >= gridSize - 7 && c < 7;

      let isFilled = false;
      if (isTopLeft) {
        isFilled = (r === 0 || r === 6 || c === 0 || c === 6) || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      } else if (isTopRight) {
        const rc = c - (gridSize - 7);
        isFilled = (r === 0 || r === 6 || rc === 0 || rc === 6) || (r >= 2 && r <= 4 && rc >= 2 && rc <= 4);
      } else if (isBottomLeft) {
        const rr = r - (gridSize - 7);
        isFilled = (rr === 0 || rr === 6 || c === 0 || c === 6) || (rr >= 2 && rr <= 4 && c >= 2 && c <= 4);
      } else if (r === 6 || c === 6) {
        // Timing pattern
        isFilled = (r + c) % 2 === 0;
      } else {
        // Deterministic pseudo-random based on token characters
        const charCode = token.charCodeAt((r * gridSize + c) % token.length);
        isFilled = (charCode + r * 7 + c * 11) % 3 === 0 || (r * c) % 5 === 0;
      }

      cells.push({ r, c, isFilled });
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Timer Bar */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isExpired ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">
            {isExpired ? 'QR Expired' : 'Dynamic Session Live'}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs font-mono font-medium">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span className={`${timeLeft < 30 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-300'}`}>
            {timeFormatted}
          </span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-1000 ${timeLeft < 30 ? 'bg-rose-500' : timeLeft < 60 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
            }`}
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      {/* QR Code Canvas Frame */}
      <div className="relative p-5 bg-white rounded-2xl shadow-2xl border-4 border-indigo-600/40 transition-transform duration-300">
        {/* Animated Scanner Laser Bar */}
        {!isExpired && (
          <div className="absolute inset-x-5 top-5 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_12px_#6366f1] animate-scanline pointer-events-none z-10 opacity-75" />
        )}

        {/* SVG QR Code */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${gridSize} ${gridSize}`}
          className={`w-full h-full shape-rendering-crispEdges ${isExpired ? 'filter blur-sm grayscale opacity-30 transition-all' : ''}`}
        >
          {cells.map(({ r, c, isFilled }) =>
            isFilled ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill="#0f172a"
              />
            ) : null
          )}
        </svg>

        {/* Center Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 bg-slate-900 border-2 border-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Expired Overlay */}
        {isExpired && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center z-20">
            <ShieldAlert className="w-10 h-10 text-rose-500 mb-2" />
            <span className="text-sm font-bold text-white">QR Code Expired</span>
            <p className="text-xs text-slate-400 mt-1 mb-3">
              This attendance token has timed out for academic security.
            </p>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate Now</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Security Token Pill */}
      <div className="mt-4 flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5">
        <span className="text-xs text-slate-400 font-mono tracking-wider">
          Token: <strong className="text-indigo-400 font-bold">{qrData.token}</strong>
        </span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          title="Copy security token"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

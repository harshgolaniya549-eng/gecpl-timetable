import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  QrCode,
  Camera,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Video,
  VideoOff,
  Zap,
  Info
} from 'lucide-react';

export const QRScannerModal = ({ isOpen, onClose }) => {
  const { activeQR, submitAttendanceQR, currentUser } = useApp();
  const [tokenInput, setTokenInput] = useState('');
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamAvailable, setWebcamAvailable] = useState(true);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize input with active token if user wants instant fill
  useEffect(() => {
    if (isOpen && activeQR?.token) {
      setTokenInput('');
    }
  }, [isOpen, activeQR]);

  // Webcam stream handler
  useEffect(() => {
    if (isOpen && useWebcam) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, useWebcam]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setWebcamAvailable(true);
      } else {
        setWebcamAvailable(false);
      }
    } catch (err) {
      console.warn('Webcam permission not granted or device lacks camera:', err);
      setWebcamAvailable(false);
      setUseWebcam(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleSimulateScan = () => {
    if (!activeQR || !activeQR.active) return;
    setScanning(true);
    setTimeout(() => {
      setTokenInput(activeQR.token);
      setScanning(false);
      const res = submitAttendanceQR(activeQR.token);
      if (res.success) {
        onClose();
      }
    }, 600);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const res = submitAttendanceQR(tokenInput);
    if (res.success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isQRLive = activeQR && activeQR.active;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live Attendance Scanner</h3>
              <p className="text-[11px] text-slate-400">Scan professor's dynamic screen QR or enter security token</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Active Lecture Banner */}
          {isQRLive ? (
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                  CLASSROOM SESSION ACTIVE
                </span>
                <h4 className="text-sm font-bold text-white">{activeQR.subject}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {activeQR.code} &bull; {activeQR.room} &bull; {activeQR.professorName}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200">
                <p className="font-semibold">No Lecture QR Currently Active</p>
                <p className="text-amber-300/80 mt-0.5">
                  Your professor has not yet initiated an attendance broadcast for this period. You can test this by switching to the Professor Portal and clicking "Generate Live QR".
                </p>
              </div>
            </div>
          )}

          {/* Scanner Viewport / Camera Simulator */}
          <div className="relative aspect-video rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 overflow-hidden flex flex-col items-center justify-center text-center p-4">
            {useWebcam ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null}

            {/* Viewfinder crosshairs */}
            <div className="relative z-10 w-44 h-44 rounded-2xl border-2 border-indigo-400/80 flex items-center justify-center bg-indigo-500/5 shadow-2xl">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400 -mt-1 -ml-1" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-400 -mt-1 -mr-1" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-400 -mb-1 -ml-1" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-400 -mb-1 -mr-1" />

              {/* Scanning Laser */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee] animate-scanline" />
            </div>

            <div className="relative z-10 mt-3 text-xs text-slate-300 font-medium bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
              Align professor's QR code within viewfinder
            </div>
          </div>

          {/* Quick Simulation & Camera Toggle */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setUseWebcam(!useWebcam)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {useWebcam ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
              <span>{useWebcam ? 'Disable Webcam' : 'Use Camera'}</span>
            </button>

            {isQRLive && (
              <button
                type="button"
                onClick={handleSimulateScan}
                disabled={scanning}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-white" />
                <span>{scanning ? 'Decoding QR...' : '1-Click Auto Scan & Verify'}</span>
              </button>
            )}
          </div>

          {/* Manual Token Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-3 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Or Enter 8-Digit Attendance Token Manually:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="e.g. GEC Palanpur-AUTH-9042..."
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
              <button
                type="submit"
                disabled={!tokenInput.trim() || !isQRLive}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Submit
              </button>
            </div>
            {isQRLive && (
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center space-x-1">
                <Info className="w-3 h-3 text-indigo-400 inline" />
                <span>Currently active token: <code className="text-indigo-400 font-mono">{activeQR.token}</code></span>
              </p>
            )}
          </form>

        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertCircle, Eye, Activity, Terminal } from 'lucide-react';
import type { UseMediaPipeReturn } from '../../hooks/useMediaPipe';

interface MediaPipeTestPanelProps {
  mediapipe: UseMediaPipeReturn;
}

export const MediaPipeTestPanel: React.FC<MediaPipeTestPanelProps> = ({ mediapipe }) => {
  const { mediapipeStatus, latestFrameRef } = mediapipe;
  const [sampleNormalizedCoord, setSampleNormalizedCoord] = useState<string>('No hands detected yet');

  useEffect(() => {
    const interval = setInterval(() => {
      const frame = latestFrameRef.current;
      if (frame && (frame.normalizedLeftHand.length > 0 || frame.normalizedRightHand.length > 0)) {
        const handLabel = frame.normalizedLeftHand.length > 0 ? 'Left Wrist (Rel)' : 'Right Wrist (Rel)';
        const samplePt = frame.normalizedLeftHand[0] || frame.normalizedRightHand[0];
        setSampleNormalizedCoord(
          `${handLabel}: x=${samplePt.x}, y=${samplePt.y}, z=${samplePt.z}`
        );
      } else {
        setSampleNormalizedCoord('No hands detected in current frame');
      }
    }, 500);

    return () => clearInterval(interval);
  }, [latestFrameRef]);

  return (
    <div className="glass-panel p-4 flex flex-col gap-3 text-xs border-cyan-900/50">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-slate-200">Phase 3 MediaPipe Vision Inspector</h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
            mediapipeStatus.isReady
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
              : 'bg-amber-950/80 text-amber-400 border-amber-800/60'
          }`}
        >
          {mediapipeStatus.isReady ? 'Wasm & Model Ready' : 'Loading Engine...'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Status 1: Local Model Asset Status */}
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            {mediapipeStatus.isReady ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>1. Asset Engine</span>
          </div>
          <span className="text-[10px] text-slate-400">Local Wasm & Task Model</span>
        </div>

        {/* Status 2: Processing Loop FPS */}
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-medium text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            <span>2. Vision Loop</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Target 25 FPS ({mediapipeStatus.fps} FPS)</span>
        </div>

        {/* Status 3: Hand Count */}
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-medium text-emerald-400">
            <Eye className="w-3.5 h-3.5" />
            <span>3. Hand Detector</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{mediapipeStatus.detectedHands} of 2 Hands Active</span>
        </div>

        {/* Status 4: Skeleton Canvas Overlay Status */}
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-medium text-purple-400">
            <Terminal className="w-3.5 h-3.5" />
            <span>4. Canvas Overlay</span>
          </div>
          <span className="text-[10px] text-slate-400">60 FPS Render Loop</span>
        </div>
      </div>

      {/* Normalized Coordinate Live Inspector */}
      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 flex items-center justify-between">
        <span className="text-slate-500 font-sans font-semibold">Normalized Coordinate Stream:</span>
        <span className="text-cyan-400">{sampleNormalizedCoord}</span>
      </div>
    </div>
  );
};

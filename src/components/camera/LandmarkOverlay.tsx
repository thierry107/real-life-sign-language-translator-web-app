import React, { useEffect, useRef } from 'react';
import { HAND_CONNECTIONS } from '../../landmark/connections';
import type { ExtractedFrameData } from '../../hooks/useMediaPipe';
import type { LandmarkPoint } from '../../types';

interface LandmarkOverlayProps {
  latestFrameRef: React.RefObject<ExtractedFrameData | null>;
  isFrontCamera: boolean;
  isActive: boolean;
}

export const LandmarkOverlay: React.FC<LandmarkOverlayProps> = ({
  latestFrameRef,
  isFrontCamera,
  isActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function renderLoop() {
      if (!canvas || !ctx) return;

      // Match canvas internal resolution to client element bounds
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Clear previous frame canvas
      ctx.clearRect(0, 0, width, height);

      if (isActive && latestFrameRef.current) {
        const frame = latestFrameRef.current;

        // Draw Left Hand (Neon Cyan)
        if (frame.leftHand && frame.leftHand.length > 0) {
          drawHandSkeleton(ctx, frame.leftHand, '#06b6d4', 'rgba(6, 182, 212, 0.3)', width, height, isFrontCamera, 'Left Hand');
        }

        // Draw Right Hand (Neon Emerald)
        if (frame.rightHand && frame.rightHand.length > 0) {
          drawHandSkeleton(ctx, frame.rightHand, '#10b981', 'rgba(16, 185, 129, 0.3)', width, height, isFrontCamera, 'Right Hand');
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    }

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [latestFrameRef, isFrontCamera, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};

// Helper: Draw bone connectors, joint nodes, and bounding box for a single hand
function drawHandSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  primaryColor: string,
  glowColor: string,
  width: number,
  height: number,
  isFrontCamera: boolean,
  label: string
) {
  // Map normalized (0..1) coordinates to screen canvas pixels
  const points = landmarks.map((pt) => {
    // If front camera is mirrored, flip X coordinate for canvas alignment
    const x = isFrontCamera ? (1 - pt.x) * width : pt.x * width;
    const y = pt.y * height;
    return { x, y };
  });

  // 1. Draw Skeleton Bone Connector Lines
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = primaryColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 10;

  HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const p1 = points[startIdx];
    const p2 = points[endIdx];
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  });
  ctx.restore();

  // 2. Draw Joint Node Circles
  points.forEach((pt, idx) => {
    ctx.save();
    ctx.beginPath();

    // Larger nodes for Wrist (0) and Fingertips (4, 8, 12, 16, 20)
    const isKeyJoint = idx === 0 || idx % 4 === 0;
    const radius = isKeyJoint ? 5 : 3.5;

    ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = isKeyJoint ? '#ffffff' : primaryColor;
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = primaryColor;
    ctx.stroke();
    ctx.restore();
  });

  // 3. Draw Bounding Box & Label Badge around Hand
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.max(0, Math.min(...xs) - 15);
  const maxX = Math.min(width, Math.max(...xs) + 15);
  const minY = Math.max(0, Math.min(...ys) - 15);
  const maxY = Math.min(height, Math.max(...ys) + 15);

  ctx.save();
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
  ctx.setLineDash([]);

  // Label Badge
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(minX, Math.max(0, minY - 22), 70, 18);
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText(label, minX + 5, Math.max(12, minY - 9));
  ctx.restore();
}

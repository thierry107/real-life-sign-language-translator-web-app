import type { LandmarkPoint } from '../types';

/**
 * Normalizes 21 3D hand landmarks for ML model ingestion.
 * 1. Center Offset: Subtract wrist position (landmark 0) from all coordinates.
 * 2. Scale Invariance: Divide by hand span distance (wrist to middle MCP joint, index 9).
 * 3. Precision: Round coordinates to 4 decimal places to minimize payload size.
 */
export function normalizeHandLandmarks(landmarks: LandmarkPoint[]): LandmarkPoint[] {
  if (!landmarks || landmarks.length === 0) return [];

  const wrist = landmarks[0];
  const middleMcp = landmarks[9] || landmarks[0];

  // Calculate hand scale factor (distance between wrist and middle MCP)
  const dx = middleMcp.x - wrist.x;
  const dy = middleMcp.y - wrist.y;
  const dz = (middleMcp.z || 0) - (wrist.z || 0);
  const scaleFactor = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1.0;

  return landmarks.map((pt) => {
    const relX = (pt.x - wrist.x) / scaleFactor;
    const relY = (pt.y - wrist.y) / scaleFactor;
    const relZ = ((pt.z || 0) - (wrist.z || 0)) / scaleFactor;

    return {
      x: Math.round(relX * 10000) / 10000,
      y: Math.round(relY * 10000) / 10000,
      z: Math.round(relZ * 10000) / 10000,
      visibility: pt.visibility !== undefined ? Math.round(pt.visibility * 1000) / 1000 : undefined,
    };
  });
}

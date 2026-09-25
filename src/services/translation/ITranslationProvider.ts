import type { FrameLandmarks, PredictionResult, ConnectionStatus } from '../../types';

/**
 * Standard Translation Engine Provider Interface.
 * Decouples the UI from network / mock implementation details.
 */
export interface ITranslationProvider {
  /** Connect to the engine (WS or Mock simulation) */
  connect(): Promise<void>;

  /** Disconnect from the engine */
  disconnect(): void;

  /** Send a frame of extracted keypoints for sequence inference */
  sendFrame(landmarks: FrameLandmarks): void;

  /** Subscribe to incoming translation predictions */
  onPrediction(callback: (pred: PredictionResult) => void): void;

  /** Subscribe to provider error events */
  onError(callback: (err: string) => void): void;

  /** Subscribe to connection status changes */
  onStatusChange(callback: (status: ConnectionStatus) => void): void;

  /** Manually trigger a controlled demo gesture (for reliable presentation) */
  triggerMockGesture?(gloss: string, text: string): void;
}

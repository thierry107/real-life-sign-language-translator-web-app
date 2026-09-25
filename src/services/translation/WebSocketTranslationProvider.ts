import type { ITranslationProvider } from './ITranslationProvider';
import type { FrameLandmarks, PredictionResult, ConnectionStatus } from '../../types';
import type { ClientWebSocketMessage, ServerWebSocketMessage } from '../../websocket/protocol';

export class WebSocketTranslationProvider implements ITranslationProvider {
  private ws: WebSocket | null = null;
  private serverUrl: string;
  private sessionId: string;
  private targetLanguage: string;

  private predictionCallback: ((pred: PredictionResult) => void) | null = null;
  private errorCallback: ((err: string) => void) | null = null;
  private statusCallback: ((status: ConnectionStatus) => void) | null = null;

  // Reconnection & Heartbeat Management
  private isIntentionallyClosed = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingIntervalTimer: ReturnType<typeof setInterval> | null = null;

  // Frame Throttling (~25 FPS / 40ms interval)
  private lastSentFrameTime = 0;
  private SEND_INTERVAL_MS = 40; // 25 FPS target

  constructor(
    serverUrl = 'ws://localhost:8000/api/v1/translate/ws',
    targetLanguage = 'en-US'
  ) {
    this.serverUrl = serverUrl;
    this.targetLanguage = targetLanguage;
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }

  public setServerUrl(url: string) {
    this.serverUrl = url;
  }

  async connect(): Promise<void> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isIntentionallyClosed = false;
    this.statusCallback?.(this.reconnectAttempts > 0 ? 'RECONNECTING' : 'CONNECTING');

    try {
      console.log(`[WebSocketProvider] Connecting to FastAPI backend: ${this.serverUrl}`);
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (err: any) {
      console.error('[WebSocketProvider] WebSocket instantiation error:', err);
      this.handleError(err);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client session ended');
      this.ws = null;
    }

    this.statusCallback?.('DISCONNECTED');
    console.log('[WebSocketProvider] Connection closed cleanly.');
  }

  onPrediction(callback: (pred: PredictionResult) => void): void {
    this.predictionCallback = callback;
  }

  onError(callback: (err: string) => void): void {
    this.errorCallback = callback;
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.statusCallback = callback;
  }

  /**
   * Transmits normalized 3D hand keypoints payload over WebSocket.
   * STRICT PRIVACY GUARANTEE: Raw video frames are NEVER transmitted.
   */
  sendFrame(landmarks: FrameLandmarks): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const now = Date.now();
    if (now - this.lastSentFrameTime < this.SEND_INTERVAL_MS) {
      return; // Rate limit to 25 FPS
    }
    this.lastSentFrameTime = now;

    const payload: ClientWebSocketMessage = {
      type: 'landmarks',
      sessionId: this.sessionId,
      frameId: landmarks.frameId,
      timestamp: landmarks.timestamp,
      data: {
        leftHand: landmarks.leftHand,
        rightHand: landmarks.rightHand,
      },
    };

    try {
      this.ws.send(JSON.stringify(payload));
    } catch (err) {
      console.warn('[WebSocketProvider] Failed to send landmark frame:', err);
    }
  }

  // Socket Lifecycle Handlers
  private handleOpen() {
    console.log('[WebSocketProvider] WebSocket Connection Established.');
    this.reconnectAttempts = 0;
    this.statusCallback?.('CONNECTED');

    // Send initial configuration handshake
    const configMsg: ClientWebSocketMessage = {
      type: 'config',
      sessionId: this.sessionId,
      targetLanguage: this.targetLanguage,
      fps: 25,
    };
    this.ws?.send(JSON.stringify(configMsg));

    // Start 10-second Ping-Pong Keepalive
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent) {
    try {
      const msg: ServerWebSocketMessage = JSON.parse(event.data);

      if (msg.type === 'prediction') {
        const result: PredictionResult = {
          id: `ws_pred_${msg.timestamp}_${Math.random().toString(36).substr(2, 4)}`,
          gloss: msg.payload.gloss,
          translatedText: msg.payload.translatedText,
          confidence: msg.payload.confidence,
          timestamp: msg.timestamp,
        };

        this.predictionCallback?.(result);
      } else if (msg.type === 'pong') {
        // Heartbeat ACK received
      } else if (msg.type === 'error') {
        console.error('[WebSocketProvider] Server reported error:', msg.message);
        this.errorCallback?.(msg.message);
      }
    } catch (err) {
      console.warn('[WebSocketProvider] Malformed message received:', event.data);
    }
  }

  private handleError(event: Event) {
    console.warn('[WebSocketProvider] WebSocket error detected:', event);
    this.errorCallback?.('WebSocket connection error');
  }

  private handleClose(event: CloseEvent) {
    this.stopHeartbeat();

    if (!this.isIntentionallyClosed) {
      console.warn(`[WebSocketProvider] Socket closed unexpectedly (code ${event.code}).`);
      this.scheduleReconnect();
    } else {
      this.statusCallback?.('DISCONNECTED');
    }
  }

  // Heartbeat & Exponential Backoff Reconnect
  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingIntervalTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const pingMsg: ClientWebSocketMessage = {
          type: 'ping',
          timestamp: Date.now(),
        };
        this.ws.send(JSON.stringify(pingMsg));
      }
    }, 10000);
  }

  private stopHeartbeat() {
    if (this.pingIntervalTimer) {
      clearInterval(this.pingIntervalTimer);
      this.pingIntervalTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.isIntentionallyClosed) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocketProvider] Max reconnect retries reached.');
      this.statusCallback?.('DISCONNECTED');
      this.errorCallback?.('Unable to connect to FastAPI WebSocket backend.');
      return;
    }

    this.reconnectAttempts += 1;
    const backoffDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 16000);
    console.log(`[WebSocketProvider] Reconnecting in ${backoffDelay}ms (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    this.statusCallback?.('RECONNECTING');

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, backoffDelay);
  }
}

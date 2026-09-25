import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../state/useAppStore';
import { MockTranslationProvider } from '../services/translation/MockTranslationProvider';
import { WebSocketTranslationProvider } from '../services/translation/WebSocketTranslationProvider';
import type { ITranslationProvider } from '../services/translation/ITranslationProvider';
import type { ExtractedFrameData } from './useMediaPipe';
import type { FrameLandmarks } from '../types';

export function useTranslationEngine() {
  const providerRef = useRef<ITranslationProvider | null>(null);

  const {
    isTranslating,
    mode,
    serverUrl,
    setConnectionStatus,
    receivePrediction,
    setTranslating,
    ttsEnabled,
    targetLanguage,
  } = useAppStore();

  // Instantiate & Manage Provider lifecycle dynamically based on active mode
  useEffect(() => {
    // Cleanup previous provider before switching
    if (providerRef.current) {
      providerRef.current.disconnect();
      providerRef.current = null;
    }

    let provider: ITranslationProvider;

    if (mode === 'LIVE_WEBSOCKET') {
      console.log(`[TranslationEngine] Activating Live FastAPI WebSocket Engine: ${serverUrl}`);
      provider = new WebSocketTranslationProvider(serverUrl, targetLanguage);
    } else {
      console.log('[TranslationEngine] Activating Local Deterministic Mock Engine');
      provider = new MockTranslationProvider();
    }

    providerRef.current = provider;

    provider.onPrediction((pred) => {
      receivePrediction(pred);

      // Web Speech Synthesis TTS
      if (ttsEnabled && 'speechSynthesis' in window && pred.translatedText) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(pred.translatedText);
        utterance.lang = targetLanguage;
        window.speechSynthesis.speak(utterance);
      }
    });

    provider.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    provider.connect();

    return () => {
      if (providerRef.current) {
        providerRef.current.disconnect();
        providerRef.current = null;
      }
    };
  }, [mode, serverUrl, receivePrediction, setConnectionStatus, targetLanguage, ttsEnabled]);

  // Transmit extracted landmark frame to active translation provider
  const sendLandmarkFrame = useCallback(
    (frame: ExtractedFrameData) => {
      if (!providerRef.current || !isTranslating) return;

      const payload: FrameLandmarks = {
        frameId: Math.floor(frame.timestamp / 33),
        timestamp: frame.timestamp,
        leftHand: frame.normalizedLeftHand,
        rightHand: frame.normalizedRightHand,
      };

      providerRef.current.sendFrame(payload);
    },
    [isTranslating]
  );

  const toggleSession = useCallback(() => {
    setTranslating(!isTranslating);
  }, [isTranslating, setTranslating]);

  const triggerManualDemoGesture = useCallback((gloss: string, text: string) => {
    if (providerRef.current?.triggerMockGesture) {
      providerRef.current.triggerMockGesture(gloss, text);
    }
  }, []);

  return {
    sendLandmarkFrame,
    toggleSession,
    triggerManualDemoGesture,
  };
}

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../state/useAppStore';
import { MockTranslationProvider } from '../services/translation/MockTranslationProvider';
import type { ITranslationProvider } from '../services/translation/ITranslationProvider';
import type { ExtractedFrameData } from './useMediaPipe';
import type { FrameLandmarks } from '../types';

export function useTranslationEngine() {
  const providerRef = useRef<ITranslationProvider | null>(null);
  
  const {
    isTranslating,
    setConnectionStatus,
    receivePrediction,
    setTranslating,
    ttsEnabled,
    targetLanguage,
  } = useAppStore();

  // Instantiate Provider Engine (Phase 4 default: Deterministic Mock Engine)
  useEffect(() => {
    const provider = new MockTranslationProvider();
    providerRef.current = provider;

    provider.onPrediction((pred) => {
      receivePrediction(pred);

      // Web Speech Synthesis TTS (if enabled by user)
      if (ttsEnabled && 'speechSynthesis' in window && pred.translatedText) {
        window.speechSynthesis.cancel(); // Stop prior utterance
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
      provider.disconnect();
      providerRef.current = null;
    };
  }, [receivePrediction, setConnectionStatus, targetLanguage, ttsEnabled]);

  // Pass extracted MediaPipe frame to active Translation Engine
  const sendLandmarkFrame = useCallback((frame: ExtractedFrameData) => {
    if (!providerRef.current || !isTranslating) return;

    const payload: FrameLandmarks = {
      frameId: Math.floor(frame.timestamp / 33), // Approx frame index
      timestamp: frame.timestamp,
      leftHand: frame.normalizedLeftHand,
      rightHand: frame.normalizedRightHand,
    };

    providerRef.current.sendFrame(payload);
  }, [isTranslating]);

  // Start / Stop Live Session
  const toggleSession = useCallback(() => {
    setTranslating(!isTranslating);
  }, [isTranslating, setTranslating]);

  // Controlled Manual Demo Trigger
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

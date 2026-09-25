import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CameraViewport } from './components/camera/CameraViewport';
import { CameraTestPanel } from './components/camera/CameraTestPanel';
import { MediaPipeTestPanel } from './components/camera/MediaPipeTestPanel';
import { TranslationPanelShell } from './components/translation/TranslationPanelShell';
import { useCamera } from './hooks/useCamera';
import { useMediaPipe } from './hooks/useMediaPipe';
import type { ConnectionStatus } from './types';

export const App: React.FC = () => {
  // Phase 2 Camera Hook Instance
  const camera = useCamera();

  // Phase 3 MediaPipe Vision Hook Instance (Consumes camera independently)
  const mediapipe = useMediaPipe();

  // Application Connection & System State
  const [connectionStatus] = useState<ConnectionStatus>('MOCK_MODE');
  const [isOnline] = useState<boolean>(navigator.onLine);

  return (
    <div className="app-container">
      {/* Top Application Header */}
      <Header connectionStatus={connectionStatus} isOnline={isOnline} />

      {/* Main Responsive Grid Workspace */}
      <main className="main-content">
        {/* Left Column: Camera Viewport, Canvas Skeleton Overlay & Phase 3 Inspector */}
        <div className="flex flex-col gap-4">
          <CameraViewport camera={camera} mediapipe={mediapipe} />
          <MediaPipeTestPanel mediapipe={mediapipe} />
          <CameraTestPanel camera={camera} />
        </div>

        {/* Right Column: Live Translation Captions Shell */}
        <TranslationPanelShell />
      </main>

      {/* Bottom Telemetry Footer */}
      <Footer mediapipeReady={mediapipe.mediapipeStatus.isReady} fps={mediapipe.mediapipeStatus.fps} />
    </div>
  );
};

export default App;

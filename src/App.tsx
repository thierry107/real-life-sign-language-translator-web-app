import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CameraViewport } from './components/camera/CameraViewport';
import { CameraTestPanel } from './components/camera/CameraTestPanel';
import { TranslationPanelShell } from './components/translation/TranslationPanelShell';
import { useCamera } from './hooks/useCamera';
import type { ConnectionStatus } from './types';

export const App: React.FC = () => {
  // Phase 2 Camera Hook Instance (Exposes videoRef & stream independently for future MediaPipe consumption)
  const camera = useCamera();

  // Application Connection & System State
  const [connectionStatus] = useState<ConnectionStatus>('MOCK_MODE');
  const [isOnline] = useState<boolean>(navigator.onLine);
  const [mediapipeReady] = useState<boolean>(false);
  const [fps] = useState<number>(0);

  return (
    <div className="app-container">
      {/* Top Application Header */}
      <Header connectionStatus={connectionStatus} isOnline={isOnline} />

      {/* Main Responsive Grid Workspace */}
      <main className="main-content">
        {/* Left Column: Active Camera Feed Viewport & Phase 2 Test Verification Panel */}
        <div className="flex flex-col gap-4">
          <CameraViewport camera={camera} />
          <CameraTestPanel camera={camera} />
        </div>

        {/* Right Column: Live Translation Captions Shell */}
        <TranslationPanelShell />
      </main>

      {/* Bottom Telemetry Footer */}
      <Footer mediapipeReady={mediapipeReady} fps={fps} />
    </div>
  );
};

export default App;

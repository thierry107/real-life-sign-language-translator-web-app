import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CameraViewportShell } from './components/camera/CameraViewportShell';
import { TranslationPanelShell } from './components/translation/TranslationPanelShell';
import type { ConnectionStatus } from './types';

export const App: React.FC = () => {
  // Phase 1 Application Shell State Initializer
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
        {/* Left Column: Camera Preview & Canvas Skeleton Overlay Viewport */}
        <CameraViewportShell />

        {/* Right Column: Live Translation Captions, Controls & History Log */}
        <TranslationPanelShell />
      </main>

      {/* Bottom Engine Telemetry Footer */}
      <Footer mediapipeReady={mediapipeReady} fps={fps} />
    </div>
  );
};

export default App;

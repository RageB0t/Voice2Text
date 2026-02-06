import { useState, useEffect } from 'react';
import { RecordingHUD } from './components/RecordingHUD';
import { SettingsWindow } from './components/SettingsWindow';
import './styles.css';

function App() {
  // Simple routing based on window label or URL
  const [view, setView] = useState<'settings' | 'hud'>('settings');
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Check if we are in the HUD window
    if (window.location.pathname === '/hud' || window.name === 'hud') {
      setView('hud');
      document.body.style.backgroundColor = 'transparent'; // Ensure transparency
    }
  }, []);

  // Listen for recording state changes from backend
  useEffect(() => {
    let unlistenStart: () => void;
    let unlistenStop: () => void;

    const setupListeners = async () => {
      const { listen } = await import('@tauri-apps/api/event');
      unlistenStart = await listen('recording-start', () => {
        setIsRecording(true);
        setDuration(0);
      });
      unlistenStop = await listen('recording-stop', () => {
        setIsRecording(false);
      });
    };

    setupListeners();

    return () => {
      if (unlistenStart) unlistenStart();
      if (unlistenStop) unlistenStop();
    };
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  return (
    <div className={`app-container ${view === 'hud' ? 'hud-mode' : ''}`}>
      {view === 'settings' && <SettingsWindow />}
      {view === 'hud' && <RecordingHUD isRecording={true} duration={duration} />}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Settings, Keyboard, Mic, Cpu, Shield, Info, Power, Zap, Languages, FileText, Download } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { check } from '@tauri-apps/plugin-updater';
import { FlowGradientCursor } from './ui/flow-gradient-cursor';
import '../styles.css';

interface AppConfig {
    autostart: boolean;
    hotkey: string;
    mode: 'PressAndHold' | 'Toggle';
    language: string;
    transcriptionMode: 'Lightning' | 'Formatted';
    provider: string;
    injection_test_mode: boolean;
    focus_delay_ms: number;
    enable_typing_fallback: boolean;
    whisper_model: string;
}

type TabType = 'general' | 'hotkeys' | 'audio' | 'transcription' | 'advanced' | 'about';

export const SettingsWindow: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [config, setConfig] = useState<AppConfig>({
        autostart: true,
        hotkey: 'Ctrl+Shift+Space',
        mode: 'PressAndHold',
        language: 'en-US',
        transcriptionMode: 'Lightning',
        provider: 'Whisper',
        injection_test_mode: false,
        focus_delay_ms: 100,
        enable_typing_fallback: true,
        whisper_model: 'base',
    });
    
    const [modelExists, setModelExists] = useState(false);
    const [modelsDir, setModelsDir] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    
    // Update states
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateVersion, setUpdateVersion] = useState<string | null>(null);
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'downloading' | 'ready' | 'error'>('idle');
    const [updateProgress, setUpdateProgress] = useState(0);
    const [updateError, setUpdateError] = useState<string | null>(null);

    useEffect(() => {
        invoke<AppConfig>('get_config').then((cfg) => {
            setConfig(prev => ({ ...prev, ...cfg }));
        }).catch(err => console.error('Failed to load config:', err));
        
        invoke<string>('get_models_dir').then((dir) => {
            setModelsDir(dir);
        }).catch(err => console.error('Failed to get models dir:', err));
        
        // Listen for download progress events
        const unlisten = listen<number>('download-progress', (event) => {
            setDownloadProgress(event.payload);
        });
        
        // Check for updates on startup (silently)
        checkForUpdates();
        
        return () => {
            unlisten.then((fn) => fn());
        };
    }, []);
    
    useEffect(() => {
        if (config.provider === 'Whisper') {
            invoke<boolean>('check_model_exists', { modelName: config.whisper_model }).then((exists) => {
                setModelExists(exists);
            }).catch(err => console.error('Failed to check model:', err));
        }
    }, [config.provider, config.whisper_model]);

    const handleDownloadModel = async () => {
        try {
            setDownloadProgress(0);
            setDownloadError(null);
            
            await invoke('download_model', { modelName: config.whisper_model });
            
            setDownloadProgress(null);
            setModelExists(true);
        } catch (error) {
            console.error('Failed to download model:', error);
            setDownloadError(String(error));
            setDownloadProgress(null);
        }
    };

    const handleSave = async () => {
        try {
            setSaveStatus('saving');
            await invoke('save_config', { config });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Failed to save config:', error);
            setSaveStatus('idle');
        }
    };
    
    const checkForUpdates = async () => {
        try {
            setUpdateStatus('checking');
            setUpdateError(null);
            
            const update = await check();
            
            if (update) {
                setUpdateAvailable(true);
                setUpdateVersion(update.version);
                setUpdateStatus('idle');
            } else {
                setUpdateAvailable(false);
                setUpdateStatus('idle');
            }
        } catch (error) {
            console.error('Failed to check for updates:', error);
            setUpdateError(String(error));
            setUpdateStatus('error');
        }
    };
    
    const downloadAndInstallUpdate = async () => {
        try {
            setUpdateStatus('downloading');
            setUpdateError(null);
            
            const update = await check();
            
            if (!update) {
                setUpdateError('No update available');
                setUpdateStatus('error');
                return;
            }
            
            // Download with progress tracking
            let totalDownloaded = 0;
            let contentLength = 0;
            
            await update.downloadAndInstall((event) => {
                switch (event.event) {
                    case 'Started':
                        contentLength = event.data.contentLength || 0;
                        setUpdateProgress(0);
                        break;
                    case 'Progress':
                        totalDownloaded += event.data.chunkLength;
                        if (contentLength > 0) {
                            const progress = Math.round((totalDownloaded / contentLength) * 100);
                            setUpdateProgress(progress);
                        }
                        break;
                    case 'Finished':
                        setUpdateProgress(100);
                        setUpdateStatus('ready');
                        break;
                }
            });
            
            // Relaunch is handled automatically by downloadAndInstall
        } catch (error) {
            console.error('Failed to download update:', error);
            setUpdateError(String(error));
            setUpdateStatus('error');
        }
    };

    const tabs = [
        { id: 'general' as TabType, label: 'General', icon: Settings },
        { id: 'hotkeys' as TabType, label: 'Hotkeys', icon: Keyboard },
        { id: 'audio' as TabType, label: 'Audio', icon: Mic },
        { id: 'transcription' as TabType, label: 'Transcription', icon: Cpu },
        { id: 'advanced' as TabType, label: 'Advanced', icon: Shield },
        { id: 'about' as TabType, label: 'About', icon: Info },
    ];

    return (
        <FlowGradientCursor>
            <div className="dashboard-container">
            {/* Sidebar Navigation */}
            <div className="dashboard-sidebar">
                <div className="dashboard-logo">
                    <Zap size={24} strokeWidth={2} style={{ color: '#6AE3FF' }} />
                    <div>
                        <div className="logo-title">Vanta Dictate</div>
                    </div>
                </div>

                <nav className="dashboard-nav">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={16} strokeWidth={2} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="dashboard-footer">
                    <div className="status-indicator">
                        <div className="status-dot"></div>
                        <span>Ready</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                <div className="content-header">
                    <h1>{tabs.find(t => t.id === activeTab)?.label}</h1>
                    <button 
                        className={`save-button ${saveStatus === 'saved' ? 'saved' : ''}`}
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' && '⏳ Saving...'}
                        {saveStatus === 'saved' && '✓ Saved'}
                        {saveStatus === 'idle' && 'Save Changes'}
                    </button>
                </div>

                <div className="content-body">
                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="settings-grid">
                            {/* Status Card */}
                            <div className="setting-card status-card">
                                <div className="status-card-content">
                                    <div className="status-left">
                                        <div className="status-dot-large"></div>
                                        <div>
                                            <div className="status-title">Ready</div>
                                            <div className="status-subtitle">
                                                {config.provider === 'Whisper' && modelExists && 'Whisper – Local'}
                                                {config.provider === 'Whisper' && !modelExists && 'Whisper – Model Required'}
                                                {config.provider === 'Mock' && 'Mock Provider – Testing'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="status-hotkey">
                                        <span className="hotkey-badge">{config.hotkey}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="setting-card">
                                <div className="card-header">
                                    <Keyboard size={18} />
                                    <h3>Recording Mode</h3>
                                </div>
                                <div className="card-body">
                                    <select
                                        className="select-input"
                                        value={config.mode}
                                        onChange={(e) => setConfig({ ...config, mode: e.target.value as any })}
                                    >
                                        <option value="PressAndHold">Press & Hold</option>
                                        <option value="Toggle">Toggle</option>
                                    </select>
                                    <p className="input-hint">Hold to record, release to transcribe</p>
                                </div>
                            </div>

                            <div className="setting-card">
                                <div className="card-header">
                                    <Languages size={18} />
                                    <h3>Language</h3>
                                </div>
                                <div className="card-body">
                                    <select
                                        className="select-input"
                                        value={config.language}
                                        onChange={(e) => setConfig({ ...config, language: e.target.value })}
                                    >
                                        <option value="en-US">English</option>
                                        <option value="es-ES">Spanish</option>
                                        <option value="fr-FR">French</option>
                                        <option value="de-DE">German</option>
                                        <option value="ja-JP">Japanese</option>
                                    </select>
                                </div>
                            </div>

                            <div className="setting-card">
                                <div className="card-header">
                                    <FileText size={18} />
                                    <h3>Output Style</h3>
                                </div>
                                <div className="card-body">
                                    <div className="button-group">
                                        <button
                                            className={`group-button ${config.transcriptionMode === 'Lightning' ? 'active' : ''}`}
                                            onClick={() => setConfig({ ...config, transcriptionMode: 'Lightning' })}
                                        >
                                            ⚡ Lightning
                                        </button>
                                        <button
                                            className={`group-button ${config.transcriptionMode === 'Formatted' ? 'active' : ''}`}
                                            onClick={() => setConfig({ ...config, transcriptionMode: 'Formatted' })}
                                        >
                                            ✨ Formatted
                                        </button>
                                    </div>
                                    <p className="input-hint">Lightning: Raw | Formatted: Smart punctuation</p>
                                </div>
                            </div>

                            <div className="setting-card">
                                <div className="card-header">
                                    <Power size={18} />
                                    <h3>Startup</h3>
                                </div>
                                <div className="card-body">
                                    <label className="toggle-setting">
                                        <div className="toggle-info">
                                            <div className="toggle-label">Launch on startup</div>
                                            <div className="toggle-description">Start with Windows</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={config.autostart}
                                            onChange={(e) => setConfig({ ...config, autostart: e.target.checked })}
                                            className="toggle-input"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hotkeys Tab */}
                    {activeTab === 'hotkeys' && (
                        <div className="settings-grid">
                            <div className="setting-card">
                                <div className="card-header">
                                    <Keyboard size={18} />
                                    <h3>Activation Hotkey</h3>
                                </div>
                                <div className="card-body">
                                    <div className="hotkey-display">
                                        <div className="hotkey-value">{config.hotkey}</div>
                                        <button className="hotkey-change-btn">Change</button>
                                    </div>
                                    <p className="input-hint">Click "Change" and press your desired key combination</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Audio Tab */}
                    {activeTab === 'audio' && (
                        <div className="settings-grid">
                            <div className="setting-card">
                                <div className="card-header">
                                    <Mic size={18} />
                                    <h3>Audio Input</h3>
                                </div>
                                <div className="card-body">
                                    <p className="info-text">Using default system microphone</p>
                                    <p className="input-hint">Configure your microphone in Windows Sound Settings</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transcription Tab */}
                    {activeTab === 'transcription' && (
                        <div className="settings-grid">
                            <div className="setting-card">
                                <div className="card-header">
                                    <Cpu size={18} />
                                    <h3>Transcription Engine</h3>
                                </div>
                                <div className="card-body">
                                    <select
                                        className="select-input"
                                        value={config.provider}
                                        onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                                    >
                                        <option value="Whisper">Whisper (Local, Offline) - Default</option>
                                        <option value="Mock">Mock Provider (Testing Only)</option>
                                        <option value="Cloud">Cloud STT (Coming Soon)</option>
                                    </select>

                                    {config.provider === 'Whisper' && (
                                        <div className="whisper-config">
                                            <label className="input-label">Model Size</label>
                                            <select
                                                className="select-input"
                                                value={config.whisper_model}
                                                onChange={(e) => setConfig({ ...config, whisper_model: e.target.value })}
                                            >
                                                <option value="tiny">Tiny (~75MB, fastest)</option>
                                                <option value="base">Base (~142MB, recommended)</option>
                                                <option value="small">Small (~466MB, better accuracy)</option>
                                                <option value="medium">Medium (~1.5GB, best accuracy)</option>
                                            </select>

                                            {!modelExists ? (
                                                <div className="alert alert-warning">
                                                    <div className="alert-title">⚠️ Model Not Installed</div>
                                                    <div className="alert-body">
                                                        <p>The selected model needs to be downloaded before use.</p>
                                                        
                                                        {downloadProgress !== null ? (
                                                            <div className="download-progress">
                                                                <div className="progress-bar">
                                                                    <div 
                                                                        className="progress-fill" 
                                                                        style={{ width: `${downloadProgress}%` }}
                                                                    />
                                                                </div>
                                                                <p className="progress-text">Downloading... {downloadProgress}%</p>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                className="download-button"
                                                                onClick={handleDownloadModel}
                                                            >
                                                                Download Model
                                                            </button>
                                                        )}
                                                        
                                                        {downloadError && (
                                                            <p className="error-text">{downloadError}</p>
                                                        )}
                                                        
                                                        <p className="input-hint">Model will be saved to: {modelsDir}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="alert alert-success">
                                                    <div className="alert-title">✓ Model Ready</div>
                                                    <p className="input-hint">Model location: {modelsDir}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {config.provider === 'Mock' && (
                                        <div className="alert alert-info">
                                            <div className="alert-title">ℹ️ Test Mode</div>
                                            <p>Mock provider returns test transcriptions. Switch to Whisper for real transcription.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Advanced Tab */}
                    {activeTab === 'advanced' && (
                        <div className="settings-grid">
                            <div className="setting-card">
                                <div className="card-header">
                                    <Shield size={18} />
                                    <h3>Reliability & Diagnostics</h3>
                                </div>
                                <div className="card-body">
                                    <label className="toggle-setting">
                                        <div className="toggle-info">
                                            <div className="toggle-label">Injection Test Mode</div>
                                            <div className="toggle-description">Skip transcription, always inject test text</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={config.injection_test_mode}
                                            onChange={(e) => setConfig({ ...config, injection_test_mode: e.target.checked })}
                                            className="toggle-input"
                                        />
                                    </label>

                                    <label className="toggle-setting">
                                        <div className="toggle-info">
                                            <div className="toggle-label">Enable Typing Fallback</div>
                                            <div className="toggle-description">Type character-by-character if paste fails</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={config.enable_typing_fallback}
                                            onChange={(e) => setConfig({ ...config, enable_typing_fallback: e.target.checked })}
                                            className="toggle-input"
                                        />
                                    </label>

                                    <div className="slider-setting">
                                        <label className="input-label">Focus Delay: {config.focus_delay_ms}ms</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="500"
                                            step="50"
                                            value={config.focus_delay_ms}
                                            onChange={(e) => setConfig({ ...config, focus_delay_ms: parseInt(e.target.value) })}
                                            className="range-input"
                                        />
                                        <p className="input-hint">Delay after restoring focus before pasting</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* About Tab */}
                    {activeTab === 'about' && (
                        <div className="settings-grid">
                            <div className="setting-card">
                                <div className="card-body">
                                    <div className="about-content">
                                        <div className="about-logo">
                                            <Zap size={40} strokeWidth={2} style={{ color: '#6AE3FF' }} />
                                        </div>
                                        <h2>Vanta Dictate</h2>
                                        <p className="version">Version 0.1.0</p>
                                        <p className="description">
                                            Premium speech-to-text dictation for Windows.
                                            Speak naturally, type effortlessly.
                                        </p>
                                        <div className="about-links">
                                            <a href="#" className="about-link">Documentation</a>
                                            <a href="#" className="about-link">Support</a>
                                            <a href="#" className="about-link">Privacy Policy</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Updates Section */}
                            <div className="setting-card">
                                <div className="card-header">
                                    <Download size={18} />
                                    <h3>Updates</h3>
                                </div>
                                <div className="card-body">
                                    {updateStatus === 'checking' && (
                                        <div className="update-status">
                                            <p className="info-text">Checking for updates...</p>
                                        </div>
                                    )}
                                    
                                    {updateStatus === 'idle' && !updateAvailable && (
                                        <div className="update-status">
                                            <p className="info-text">You're up to date</p>
                                            <button 
                                                className="secondary-button"
                                                onClick={checkForUpdates}
                                            >
                                                Check for Updates
                                            </button>
                                        </div>
                                    )}
                                    
                                    {updateAvailable && updateStatus !== 'downloading' && updateStatus !== 'ready' && (
                                        <div className="alert alert-info">
                                            <div className="alert-title">
                                                <span className="update-badge">Update Available</span>
                                            </div>
                                            <div className="alert-body">
                                                <p>Version {updateVersion} is available</p>
                                                <button 
                                                    className="download-button"
                                                    onClick={downloadAndInstallUpdate}
                                                >
                                                    Download & Restart
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {updateStatus === 'downloading' && (
                                        <div className="update-status">
                                            <div className="download-progress">
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill" 
                                                        style={{ width: `${updateProgress}%` }}
                                                    />
                                                </div>
                                                <p className="progress-text">Downloading update... {updateProgress}%</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {updateStatus === 'ready' && (
                                        <div className="alert alert-success">
                                            <div className="alert-title">✓ Update Ready</div>
                                            <p>Restarting application...</p>
                                        </div>
                                    )}
                                    
                                    {updateStatus === 'error' && updateError && (
                                        <div className="alert alert-warning">
                                            <div className="alert-title">⚠️ Update Failed</div>
                                            <p className="error-text">{updateError}</p>
                                            <button 
                                                className="secondary-button"
                                                onClick={checkForUpdates}
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </FlowGradientCursor>
    );
};

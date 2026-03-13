import React, { useState } from 'react';
import { Camera, Shield, Heart, Settings, Activity, Users, Save, AlertTriangle } from 'lucide-react';
import PoseDetector from './components/PoseDetector';
import EmergencyResources from './components/EmergencyResources';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [alertActive, setAlertActive] = useState(false);
  const [alertLog, setAlertLog] = useState([]);

  // Settings State
  const [settings, setSettings] = useState({
    adminEmail: 'thondapuprudhvi@gmail.com',
    agencyEmail: 'ramanapola192@gmail.com',
    hospitalEmail: 'tprudhvi@gmail.com',
    smsAlerts: true,
    cameraName: 'Hostel Lobby Cam 01',
    sensitivity: 'high'
  });

  const [saveMessage, setSaveMessage] = useState('');

  const AlertSignal = () => {
    if (!alertActive) return null;
    return (
      <div className="global-alert-bar slide-down">
        <div className="alert-content">
          <AlertTriangle className="alert-icon pulse" />
          <span>CRITICAL ALERT: POTENTIAL DANGER DETECTED - AUTHORITIES NOTIFIED</span>
        </div>
      </div>
    );
  };

  const handleAlertTriggered = (isAlert) => {
    if (isAlert && !alertActive) {
      setAlertActive(true);
      setAlertLog(prev => [...prev, new Date().toLocaleTimeString() + " - Critical Pose Detected!"]);
      console.log('ALERT! Sending email via backend...');
      fetch('http://localhost:3001/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: new Date().toISOString(), type: 'Automated Detection' })
      }).catch(err => console.error('Error dispatching alert:', err));

      setTimeout(() => setAlertActive(false), 5000); // clear UI alert state after 5s
    }
  };

  const handleManualAlert = () => {
    setAlertActive(true);
    setAlertLog(prev => [...prev, new Date().toLocaleTimeString() + " - Manual Alert Triggered"]);
    fetch('http://localhost:3001/api/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: new Date().toISOString(), type: 'Manual Override' })
    }).catch(err => console.error('Error dispatching alert:', err));
    setTimeout(() => setAlertActive(false), 5000);
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveSettings = (e) => {
    e.preventDefault();
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
    // Real implementation would save this to backend
  };

  // Render Functions
  const renderMonitorPane = () => (
    <section className="dashboard-grid fade-in">
      <div className="card glass-panel monitor-card">
        <div className="card-header">
          <Camera className="icon" />
          <h2>Live Camera Feed</h2>
          <span className={`status-badge ${alertActive ? 'warning-status pulse' : 'active-status'}`}>
            {alertActive ? 'CRITICAL ALERT DETECTED' : 'Monitoring Active'}
          </span>
        </div>
        <div className="camera-container-wrapper">
          <PoseDetector onAlertTriggered={handleAlertTriggered} />
        </div>
      </div>

      <div className="side-panel">
        <div className="card glass-panel info-card">
          <div className="card-header">
            <Shield className="icon primary" />
            <h3>System Status</h3>
          </div>
          <ul className="status-list">
            <li><strong>AI Engine:</strong> <div className="status-dot green"></div> <span className="text-success">Online</span></li>
            <li><strong>Alert Server:</strong> <div className="status-dot green"></div> <span className="text-success">Connected</span></li>
            <li><strong>Active Camera:</strong> {settings.cameraName}</li>
            <li><strong>Registered Authorities:</strong> 3</li>
          </ul>
        </div>

        <EmergencyResources />

        <div className="card glass-panel control-card">
          <div className="card-header">
            <Heart className="icon accent" />
            <h3>Emergency Override</h3>
          </div>
          <p>Manually trigger an alert flow immediately. This will bypass AI inference and notify all registered authorities.</p>
          <button className="btn-danger pulse-btn" onClick={handleManualAlert}>Trigger Manual Alert</button>
        </div>

        <div className="card glass-panel info-card log-card">
          <div className="card-header">
            <Activity className="icon text-light" />
            <h3>Activity Log</h3>
          </div>
          <ul className="status-list log-list">
            {alertLog.length === 0 ? (
              <li><span className="text-light">No critical events detected today.</span></li>
            ) : (
              alertLog.map((log, i) => (
                <li key={i} className="log-item slide-in">
                  <span className="text-danger">{log}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );

  const renderSettingsPane = () => (
    <section className="settings-section fade-in">
      <div className="glass-panel settings-panel">
        <div className="settings-header">
          <Settings className="icon" style={{ width: '32px', height: '32px' }} />
          <h2>HOPE System Configuration</h2>
        </div>
        <p className="settings-desc">Manage your alerting endpoints, notification preferences, and AI sensitivity to tailor the HOPE system to your specific environment.</p>

        <form onSubmit={saveSettings} className="settings-form">
          <div className="form-group">
            <label><Users className="form-icon" /> Administrator / Warden Email</label>
            <input
              type="email"
              name="adminEmail"
              value={settings.adminEmail}
              onChange={handleSettingChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label><Shield className="form-icon" /> Security Agency Email</label>
            <input
              type="email"
              name="agencyEmail"
              value={settings.agencyEmail}
              onChange={handleSettingChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label><Heart className="form-icon" /> Emergency Medical / Hospital Email</label>
            <input
              type="email"
              name="hospitalEmail"
              value={settings.hospitalEmail}
              onChange={handleSettingChange}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Camera Designation</label>
              <input
                type="text"
                name="cameraName"
                value={settings.cameraName}
                onChange={handleSettingChange}
                className="form-input"
              />
            </div>
            <div className="form-group half">
              <label>AI Sensitivity Threshold</label>
              <select
                name="sensitivity"
                value={settings.sensitivity}
                onChange={handleSettingChange}
                className="form-select"
              >
                <option value="low">Low (Fewer False Alarms)</option>
                <option value="medium">Medium</option>
                <option value="high">High (Maximum Safety)</option>
              </select>
            </div>
          </div>

          <div className="form-group inline-checkbox">
            <input
              type="checkbox"
              id="smsAlerts"
              name="smsAlerts"
              checked={settings.smsAlerts}
              onChange={handleSettingChange}
            />
            <label htmlFor="smsAlerts">Enable SMS Text Alerts (Requires Twilio Integration)</label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <Save className="btn-icon" /> Save Configuration
            </button>
            {saveMessage && <span className="save-message text-success fade-in">{saveMessage}</span>}
          </div>
        </form>
      </div>
    </section>
  );

  return (
    <div className="app-container">
      <AlertSignal />
      <header className="header glass-panel">
        <div className="container flex-between nav-container">
          <div className="logo-container">
            <img src="/hope-logo.png" alt="HOPE Logo" className="logo-img glow" />
            <span className="logo-text gradient-text">HOPE</span>
          </div>
          <nav className="main-nav">
            <button
              className={`nav-button ${activeTab === 'monitor' ? 'active' : ''}`}
              onClick={() => setActiveTab('monitor')}
            >
              Monitor Feed
            </button>
            <button
              className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Configuration
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content container">
        <section className="hero-section text-center fade-in">
          <h1 className="hero-title glow-text">Life-Saving AI Intelligence</h1>
          <p className="hero-subtitle">"One alert, one moment, one life saved."</p>
        </section>

        {activeTab === 'monitor' ? renderMonitorPane() : renderSettingsPane()}

      </main>

      <footer className="footer shadow-top">
        <div className="container">
          <p className="footer-text shine-text">"If HOPE can give even one life a second chance, then this project has already succeeded"</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

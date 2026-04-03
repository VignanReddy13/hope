import React, { useState, useEffect, useRef } from 'react';
import { Camera, Shield, Heart, Settings, Activity, Users, Save, AlertTriangle, UserCheck, BellRing } from 'lucide-react';
import Header from './components/Header';
import PoseDetector from './components/PoseDetector';
import EmergencyResources from './components/EmergencyResources';
import LocationTracking from './components/LocationTracking';

function App() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [alertActive, setAlertActive] = useState(false);
  const [alertLog, setAlertLog] = useState([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), message: 'System initialized. Monitoring active.', type: 'info' }
  ]);
  const [confidence, setConfidence] = useState(12);

  const audioRef = useRef(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio('/freesound_community-emergency-alarm-69780.mp3');
    audio.loop = true;
    audioRef.current = audio;
  }, []);

  const playAlarm = () => {
    setIsAudioMuted(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio playback auto-blocked by browser:", e));
    }
  };

  const silenceAlarm = () => {
    setIsAudioMuted(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Settings State
  const [settings, setSettings] = useState({
    adminEmail: 'vignanreddy@gmail.com',
    agencyEmail: 'ramanapola192@gmail.com',
    hospitalEmail: 'rishitha1@gmail.com',
    smsAlerts: true,
    cameraName: 'SV University, Tirupati (PIN-517501) Cam 01',
    sensitivity: 'high'
  });

  const [saveMessage, setSaveMessage] = useState('');

  // Mock Student Data
  const studentInfo = {
    id: "B.Tech/2026/412",
    status: "In Room (Active)",
    lastSeen: "Just now"
  };

  const AlertSignal = () => {
    if (!alertActive) return null;
    return (
      <div style={{ zIndex: 99999 }} className="fixed inset-0 pointer-events-auto flex items-center justify-center p-4 isolate">
        <style>{`
          @keyframes flashRedBanner {
            0%, 100% { background-color: rgba(220, 38, 38, 0.95); box-shadow: 0 0 50px rgba(239, 68, 68, 0.9), inset 0 0 40px rgba(185, 28, 28, 0.5); border-color: rgba(252, 165, 165, 0.8); }
            50% { background-color: rgba(153, 27, 27, 0.85); box-shadow: 0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(185, 28, 28, 0.3); border-color: rgba(239, 68, 68, 0.5); }
          }
          .anim-flash-banner {
            animation: flashRedBanner 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes flashTextBlink {
            0%, 100% { opacity: 1; text-shadow: 0 0 20px rgba(255,255,255,0.7); transform: scale(1); }
            50% { opacity: 0.8; text-shadow: 0 0 5px rgba(255,255,255,0.2); transform: scale(0.98); }
          }
          .anim-flash-text {
            animation: flashTextBlink 1.2s ease-in-out infinite;
          }
        `}</style>
        
        {/* Full Viewport Dark Overlay to emphasize banner */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md -z-10"></div>
        
        {/* Flashing Modal Banner */}
        <div className="w-full max-w-4xl border-4 p-8 md:p-14 flex flex-col items-center justify-center gap-8 rounded-3xl anim-flash-banner relative pointer-events-auto shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-center text-center gap-8">
            <AlertTriangle className="w-20 h-20 md:w-28 md:h-28 text-white animate-bounce shrink-0 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            <div className="flex flex-col justify-center items-center md:items-start gap-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-widest leading-tight anim-flash-text m-0">
                CRITICAL ALERT<br/>DETECTED
              </h1>
              <h2 className="text-xl md:text-2xl font-bold tracking-widest text-slate-100 uppercase opacity-90 m-0">
                — Emergency Services Notified —
              </h2>
            </div>
          </div>
          
          {/* Centered Silence Button */}
          <button 
            onClick={silenceAlarm} 
            className="mt-6 uppercase font-black text-red-700 tracking-widest bg-white hover:bg-slate-100 text-lg md:text-2xl px-12 py-5 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] border-2 border-transparent focus:border-red-500 focus:outline-none"
          >
            {isAudioMuted ? 'ALARM SILENCED' : 'SILENCE ALARM'}
          </button>
        </div>
      </div>
    );
  };

  const handleAlertTriggered = (isAlert) => {
    if (isAlert && !alertActive) {
      setAlertActive(true);
      setConfidence(92);
      playAlarm();
      
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAlertLog(prev => [{ time: timeStr, message: 'High risk detected', type: 'critical' }, ...prev]);
      
      console.log('ALERT! Sending email via backend...');
      fetch('http://localhost:3001/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          timestamp: new Date().toISOString(), 
          type: 'HIGH RISK: Unconscious / Posture Fall',
          location: settings.cameraName,
          nearestHospital: 'SVIMS',
          distance: '1.2km'
        })
      })
      .then(res => res.json())
      .then(data => {
        if(data.success) {
           const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
           setAlertLog(prev => [{ time: logTime, message: 'Email Dispatch Confirmed', type: 'info' }, ...prev]);
        }
      })
      .catch(err => console.error('Error dispatching alert:', err));

      fetch('http://localhost:3001/api/trigger-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventType: 'hanging', 
          location: settings.cameraName, 
          confidenceScore: 0.92 
        })
      }).catch(err => console.error('Error storing event:', err));

      setTimeout(() => {
        setAlertActive(false);
        setConfidence(15);
        if(audioRef.current) {
          audioRef.current.pause();
        }
      }, 8000);
    }
  };

  const handleManualAlert = () => {
    setAlertActive(true);
    setConfidence(99);
    playAlarm();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAlertLog(prev => [{ time: timeStr, message: 'Manual Alert Triggered', type: 'critical' }, ...prev]);
    
    fetch('http://localhost:3001/api/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        timestamp: new Date().toISOString(), 
        type: 'HIGH RISK: Manual Override',
        location: settings.cameraName,
        nearestHospital: 'SVIMS',
        distance: '1.2km'
      })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
         const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
         setAlertLog(prev => [{ time: logTime, message: 'Email Dispatch Confirmed', type: 'info' }, ...prev]);
      }
    })
    .catch(err => console.error('Error dispatching alert:', err));
    
    setTimeout(() => {
      setAlertActive(false);
      setConfidence(15);
      if(audioRef.current) {
        audioRef.current.pause();
      }
    }, 8000);
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
  };

  // Render Functions
  const renderMonitorPane = () => (
    <div className="flex flex-col gap-6 animate-fade-in w-full max-w-[1500px] mx-auto pb-10">
      
      {/* Top Grid: Camera (Left) + Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Live Camera Feed */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className={`glass-card p-6 flex flex-col gap-5 rounded-2xl relative transition-all duration-500 ${alertActive ? 'glow-border-alert' : 'glow-border'}`}>
            <div className="flex justify-between items-center z-10 relative">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${alertActive ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></div>
                <h2 className="text-xl font-display font-bold text-white tracking-wide">Live Camera Feed</h2>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Confidence</p>
                  <p className={`text-xl font-bold font-display ${alertActive ? 'text-red-400' : 'text-brand-success drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}>
                    {confidence}%
                  </p>
                </div>
                <span className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg backdrop-blur-md transition-colors ${alertActive ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'}`}>
                  {alertActive ? 'HIGH RISK' : 'Monitoring Active'}
                </span>
              </div>
            </div>
            
            <div className="w-full aspect-video bg-black/60 rounded-xl overflow-hidden relative border border-white/10 shadow-inner group">
              <PoseDetector onAlertTriggered={handleAlertTriggered} setConfidence={setConfidence} currentConfidence={confidence} />
            </div>

            {/* Risk Indicator Bar */}
            <div className="flex items-center justify-between glass-panel rounded-xl p-4 mt-1 border-white/5">
               <div className="flex items-center gap-4">
                 <span className="text-sm font-semibold text-slate-300 font-display tracking-wide">Risk Level:</span>
                 <div className="flex gap-2">
                   <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-all duration-300 ${!alertActive && confidence < 50 ? 'bg-brand-success/20 text-brand-success border border-brand-success/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-[rgba(15,23,42,0.6)] text-slate-500 border border-transparent'}`}>SAFE</div>
                   <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-all duration-300 ${!alertActive && confidence >= 50 ? 'bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30 shadow-[0_0_10px_rgba(254,240,138,0.2)]' : 'bg-[rgba(15,23,42,0.6)] text-slate-500 border border-transparent'}`}>AT RISK</div>
                   <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-all duration-300 ${alertActive ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse-soft' : 'bg-[rgba(15,23,42,0.6)] text-slate-500 border border-transparent'}`}>HIGH RISK</div>
                 </div>
               </div>
               <button className="bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border border-brand-primary/30 px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(20,184,166,0.1)] hover:shadow-[0_0_20px_rgba(20,184,166,0.25)]">
                  <Camera className="w-4 h-4"/> Live Camera Feed
               </button>
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar */}
        <div className="flex flex-col gap-6">
          
          {/* Card 1: System Status */}
          <div className="glass-panel rounded-2xl p-5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-4">
              <Shield className="w-5 h-5 text-brand-primary drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
              <h3 className="text-[15px] font-display font-bold text-white tracking-wide">System Status</h3>
            </div>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-slate-400">AI Engine</span>
                <div className="flex items-center gap-2 bg-brand-success/10 px-2.5 py-1 rounded-md border border-brand-success/20">
                  <span className="w-2 h-2 rounded-full bg-brand-success shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                  <span className="text-brand-success text-[11px] font-bold tracking-wider uppercase">Online</span>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-400">Server</span>
                <div className="flex items-center gap-2 bg-brand-success/10 px-2.5 py-1 rounded-md border border-brand-success/20">
                  <span className="w-2 h-2 rounded-full bg-brand-success shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                  <span className="text-brand-success text-[11px] font-bold tracking-wider uppercase">Connected</span>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-400">Cameras</span>
                <span className="text-brand-primary font-bold text-xs bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-1 rounded-md">1 Active</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Student Info */}
          <div className="glass-panel rounded-2xl p-5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-4">
              <UserCheck className="w-5 h-5 text-brand-secondary drop-shadow-[0_0_8px_rgba(254,240,138,0.4)]" />
              <h3 className="text-[15px] font-display font-bold text-white tracking-wide">Student Info</h3>
            </div>
             <ul className="flex flex-col gap-3 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-slate-400">ID Number</span>
                <span className="text-white font-medium">{studentInfo.id}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-400">Status</span>
                <span className="text-brand-success font-medium">{studentInfo.status}</span>
              </li>
               <li className="flex justify-between items-center">
                <span className="text-slate-400">Last Seen</span>
                <span className="text-slate-300 font-medium">{studentInfo.lastSeen}</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Alert Status */}
           <div className="glass-panel rounded-2xl p-5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-4">
              <BellRing className={`w-5 h-5 ${alertActive ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
              <h3 className="text-[15px] font-display font-bold text-white tracking-wide">Alert Status</h3>
            </div>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className={`p-2.5 border rounded-lg flex items-center justify-between transition-colors ${!alertActive && confidence < 50 ? 'border-brand-success/30 bg-brand-success/10 text-brand-success' : 'border-white/5 bg-black/20 text-slate-500'}`}>
                <span className="font-semibold text-xs tracking-wide">Level 1 (Safe)</span>
                <div className={`w-2 h-2 rounded-full ${!alertActive && confidence < 50 ? 'bg-brand-success shadow-[0_0_5px_rgba(16,185,129,0.8)]' : 'bg-slate-700'}`}></div>
              </div>
               <div className={`p-2.5 border rounded-lg flex items-center justify-between transition-colors ${!alertActive && confidence >= 50 ? 'border-brand-secondary/30 bg-brand-secondary/10 text-brand-secondary' : 'border-white/5 bg-black/20 text-slate-500'}`}>
                <span className="font-semibold text-xs tracking-wide">Level 2 (Warning)</span>
                <div className={`w-2 h-2 rounded-full ${!alertActive && confidence >= 50 ? 'bg-brand-secondary shadow-[0_0_5px_rgba(254,240,138,0.8)]' : 'bg-slate-700'}`}></div>
              </div>
               <div className={`p-2.5 border rounded-lg flex items-center justify-between transition-colors ${alertActive ? 'border-red-500/50 bg-red-500/20 text-red-500' : 'border-white/5 bg-black/20 text-slate-500'}`}>
                <span className="font-semibold text-xs tracking-wide">Level 3 (Critical)</span>
                <div className={`w-2.5 h-2.5 rounded-full ${alertActive ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-slate-700'}`}></div>
              </div>
            </div>
          </div>

          {/* Card 4: Activity Log */}
          <div className="glass-panel rounded-2xl p-5 flex-1 flex flex-col max-h-[300px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-brand-primary" />
                <h3 className="text-[15px] font-display font-bold text-white tracking-wide">Activity Log</h3>
              </div>
              <button className="text-[10px] uppercase text-slate-500 hover:text-slate-300 tracking-wider">Clear</button>
            </div>
            <ul className="flex flex-col gap-0 overflow-y-auto pr-2 relative border-l border-white/10 ml-2 scrollbar-thin scrollbar-thumb-white/10">
              {alertLog.map((logItem, i) => (
                <li key={i} className="text-[13px] py-3.5 pl-5 relative animate-fade-in group">
                  <div className={`absolute w-[9px] h-[9px] rounded-full top-[18px] -left-[5px] border-[1.5px] border-slate-900 ${logItem.type === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : logItem.type === 'warning' ? 'bg-brand-secondary' : 'bg-brand-success'}`}></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-slate-400 font-medium tracking-wide">{logItem.time}</span>
                    <span className={`leading-snug ${logItem.type === 'critical' ? 'text-red-300 font-semibold drop-shadow-md' : 'text-slate-300'}`}>{logItem.message}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Section: Location and Hospitals */}
      <LocationTracking />

    </div>
  );

  const renderSettingsPane = () => (
    <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 animate-fade-in mt-6 border-white/5">
      <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-6">
        <Settings className="w-8 h-8 text-brand-primary drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]" />
        <h2 className="text-2xl font-display font-bold text-white tracking-wide">System Configuration</h2>
      </div>
      <p className="text-slate-400 mb-8 leading-relaxed font-light">
        Manage alerting endpoints, notification preferences, and AI sensitivity dynamically.
      </p>

      <form onSubmit={saveSettings} className="flex flex-col gap-6 text-white">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
            <Users className="w-4 h-4 text-brand-primary" /> Administrator Email
          </label>
          <input
            type="email"
            name="adminEmail"
            value={settings.adminEmail}
            onChange={handleSettingChange}
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 focus:bg-black/50 focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/50 outline-none transition-all text-white placeholder-slate-500"
            required
          />
        </div>

        <div>
           <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
            <Shield className="w-4 h-4 text-brand-primary" /> Security Agency Email
          </label>
          <input
            type="email"
            name="agencyEmail"
            value={settings.agencyEmail}
            onChange={handleSettingChange}
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 focus:bg-black/50 focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/50 outline-none transition-all text-white"
            required
          />
        </div>

        <div>
           <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
            <Heart className="w-4 h-4 text-brand-primary" /> Medical / Hospital Email
          </label>
          <input
            type="email"
            name="hospitalEmail"
            value={settings.hospitalEmail}
            onChange={handleSettingChange}
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 focus:bg-black/50 focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/50 outline-none transition-all text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">Camera Designation</label>
            <input
              type="text"
              name="cameraName"
              value={settings.cameraName}
              onChange={handleSettingChange}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 focus:bg-black/50 focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/50 outline-none transition-all text-white"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">AI Sensitivity Threshold</label>
            <select
              name="sensitivity"
              value={settings.sensitivity}
              onChange={handleSettingChange}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[rgba(15,23,42,0.8)] focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/50 outline-none transition-all text-white appearance-none"
            >
              <option value="low">Low (Fewer False Alarms)</option>
              <option value="medium">Medium</option>
              <option value="high">High (Maximum Safety)</option>
            </select>
          </div>
        </div>

         <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-2">
          <input
            type="checkbox"
            id="smsAlerts"
            name="smsAlerts"
            checked={settings.smsAlerts}
            onChange={handleSettingChange}
            className="w-5 h-5 accent-brand-primary bg-black/30 border-white/20 rounded cursor-pointer"
          />
          <label htmlFor="smsAlerts" className="text-sm text-slate-300 cursor-pointer select-none">
            Enable SMS Text Alerts (Requires Twilio Integration)
          </label>
        </div>

         <div className="mt-4 flex items-center gap-6 pt-4">
          <button type="submit" className="flex items-center gap-2 bg-brand-primary hover:bg-teal-400 text-slate-900 px-8 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all hover:-translate-y-0.5">
            <Save className="w-5 h-5" /> Save Configuration
          </button>
          {saveMessage && <span className="text-brand-success font-medium animate-fade-in drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{saveMessage}</span>}
        </div>
      </form>
       {/* Manual trigger section inside settings for admin */}
       <div className="mt-10 p-6 border border-red-500/20 bg-red-500/5 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-[15px] font-display font-bold text-red-400 tracking-wide">Emergency Override</h3>
            </div>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed font-light">
              Manually trigger an alert flow immediately. Bypasses AI inference and notifies authorities.
            </p>
            <button 
              onClick={handleManualAlert}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:-translate-y-0.5"
            >
              Trigger Manual Alert Signal
            </button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-primary/30 relative">
      <AlertSignal />
      
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[150px] rounded-full mix-blend-screen transition-colors duration-1000 ${alertActive ? 'bg-red-500/20' : 'bg-brand-secondary/5'}`}></div>
      </div>

      <Header activeTab={activeTab} setActiveTab={setActiveTab} alertActive={alertActive} />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1500px] mx-auto px-6 pt-10 pb-16">
        
        {/* Life-Saving AI Header Section */}
        <div className="border-l-4 border-brand-primary pl-6 mb-12 animate-fade-in group hover:border-brand-primary/80 transition-all duration-300">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tighter drop-shadow-2xl">
            Life-Saving AI <span className="text-brand-primary">Intelligence</span>
          </h1>
          <p className="text-sm md:text-base italic text-slate-500 font-medium mt-2 tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
            "One alert, one moment, one life saved."
          </p>
        </div>

        {activeTab === 'monitor' ? renderMonitorPane() : renderSettingsPane()}
      </main>

    </div>
  );
}

export default App;

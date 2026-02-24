import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

const socket = io('http://localhost:3000');

function App() {
  const [devices, setDevices] = useState([]);
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const calculateRemaining = (session) => {
    if (!session || session.status !== 'active') return 0;
    const start = new Date(session.start_time).getTime();
    const durationMs = (session.duration_minutes || 0) * 60 * 1000;
    const endTime = start + durationMs;
    return Math.max(0, Math.floor((endTime - Date.now()) / 1000));
  };

  const formatCountdown = (totalSeconds) => {
    if (totalSeconds <= 0) return 'No session';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const fetchData = async () => {
    try {
      const devRes = await fetch('http://localhost:3000/devices');
      if (!devRes.ok) throw new Error(`Devices failed: ${devRes.status}`);
      const devData = await devRes.json();
      const computers = devData.filter(d => d.type === 'computer');
      setDevices(computers);

      const sesRes = await fetch('http://localhost:3000/sessions');
      if (!sesRes.ok) throw new Error(`Sessions failed: ${sesRes.status}`);
      const sesData = await sesRes.json();

      const map = {};
      sesData.forEach(s => {
        if (s.status === 'active' || s.status === 'paused') {
          map[s.device_id] = s;
        }
      });
      setSessions(map);

      setLoading(false);
      setErrorMsg(null);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    socket.on('status_update', fetchData);
    socket.on('session_update', fetchData);
    return () => {
      socket.off('status_update');
      socket.off('session_update');
    };
  }, []);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const getIconColor = (device) => {
    if (device?.status !== 'online') return 'red';
    const timeLeft = calculateRemaining(sessions[device.id]);
    if (timeLeft <= 60 && timeLeft > 0) return 'yellow';
    return 'blue';
  };

  const handleStartSession = async (device_id, minutes) => {
    try {
      const res = await fetch('http://localhost:3000/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id, duration_minutes: minutes })
      });
      if (!res.ok) throw new Error('Start failed');
      toast.success(`Started ${minutes} min`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddTime = async (device_id, minutes) => {
    try {
      const res = await fetch('http://localhost:3000/extra-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id, extra_minutes: minutes })
      });
      if (!res.ok) throw new Error('Add time failed');
      toast.success(`Added +${minutes} min`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePauseSession = async (device_id) => {
    try {
      const res = await fetch('http://localhost:3000/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id })
      });
      if (!res.ok) throw new Error('Pause failed');
      toast.info('Paused');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResumeSession = async (device_id) => {
    try {
      const res = await fetch('http://localhost:3000/resume-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id })
      });
      if (!res.ok) throw new Error('Resume failed');
      toast.success('Resumed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEndSession = async (device_id) => {
    try {
      const res = await fetch('http://localhost:3000/end-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id })
      });
      if (!res.ok) throw new Error('End failed');
      toast.success('Ended');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const startTestSession = async () => {
    const dev = devices.find(d => d.status === 'online') || devices[0];
    if (!dev) return toast.error('No devices');
    await handleStartSession(dev.id, 1);
    toast.info('Test 1-min started');
  };

  if (loading) return <div style={{ padding: '40px', fontSize: '1.5rem' }}>Loading devices...</div>;
  if (errorMsg) return <div style={{ color: 'red', padding: '40px', fontSize: '1.5rem' }}>Error: {errorMsg}</div>;

  return (
    <div className="app-container">
      <h1>Mario Gaming Manager</h1>

      <button className="test-btn" onClick={startTestSession}>
        Test 1-Minute Session
      </button>

      <table className="device-table">
        <thead>
          <tr>
            <th>Icon</th>
            <th>Name</th>
            <th>Status</th>
            <th>Countdown</th>
            <th>Start Session</th>
            <th>Add Time</th>
            <th>Pause</th>
            <th>Resume</th>
            <th>End Session</th>
          </tr>
        </thead>
        <tbody>
          {devices.map(dev => {
            const session = sessions[dev.id];
            const secondsLeft = calculateRemaining(session);
            const countdownText = formatCountdown(secondsLeft);
            const iconColor = getIconColor(dev);
            const isActive = session?.status === 'active';
            const isPaused = session?.status === 'paused';

            return (
              <tr key={dev.id}>
                <td className="icon-cell">
                  <div className={`computer-icon-bg ${iconColor}`}>
                    <span className={`computer-icon ${iconColor}`}>🖥️</span>
                  </div>
                </td>
                <td>{dev.name || 'Unknown'}</td>
                <td className={dev.status === 'online' ? 'online' : 'offline'}>
                  {dev.status || 'unknown'}
                </td>
                <td className={`countdown ${secondsLeft <= 300 && secondsLeft > 0 ? 'low-time' : ''}`}>
                  {countdownText}
                </td>

                {/* Start Session */}
                <td className="start-session-column">
                  {[30, 60, 90, 120].map(min => (
                    <button key={min} onClick={() => handleStartSession(dev.id, min)}>
                      Start {min} min
                    </button>
                  ))}
                </td>

                {/* Add Time */}
                <td className="add-time-column">
                  {[15, 30, 60].map(min => (
                    <button key={min} onClick={() => handleAddTime(dev.id, min)}>
                      +{min} min
                    </button>
                  ))}
                </td>

                {/* Pause */}
                <td className="pause-column">
                  {isActive && (
                    <button className="pause-btn" onClick={() => handlePauseSession(dev.id)}>
                      Pause
                    </button>
                  )}
                </td>

                {/* Resume */}
                <td className="resume-column">
                  {isPaused && (
                    <button className="resume-btn" onClick={() => handleResumeSession(dev.id)}>
                      Resume
                    </button>
                  )}
                </td>

                {/* End Session */}
                <td className="end-column">
                  {(isActive || isPaused) && (
                    <button className="end-btn" onClick={() => handleEndSession(dev.id)}>
                      End Session
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ToastContainer />
    </div>
  );
}

export default App;
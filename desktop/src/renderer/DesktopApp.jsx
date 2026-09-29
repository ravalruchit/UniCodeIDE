import React, { useState, useEffect } from 'react';
import DeviceEnrollment from './DeviceEnrollment';
import DesktopLogin from './DesktopLogin';
import LabHome from './LabHome';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function DesktopApp() {
  const [appState, setAppState] = useState('LOADING'); // 'LOADING' | 'UNENROLLED' | 'LOGIN' | 'HOME' | 'DISABLED'
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [labInfo, setLabInfo] = useState(null);
  const [student, setStudent] = useState(null);
  const [session, setSession] = useState(null);
  const [token, setToken] = useState(null);
  const [kioskActive, setKioskActive] = useState(false);

  // Check enrollment on startup
  useEffect(() => {
    async function checkDeviceStatus() {
      try {
        if (window.desktopAPI?.device?.getStatus) {
          const status = await window.desktopAPI.device.getStatus();
          if (status.isEnrolled) {
            setDeviceInfo(status);
            setAppState('LOGIN');
          } else {
            setAppState('UNENROLLED');
          }
        } else {
          // Development simulation mode
          setDeviceInfo({
            deviceId: 'DEV-SIM-204-01',
            deviceName: 'LAB-204-17',
          });
          setLabInfo({
            name: 'Computer Science Lab 204',
            code: 'CSE-204',
          });
          setAppState('LOGIN');
        }
      } catch (err) {
        console.error('[DesktopApp] Init error:', err);
        setAppState('UNENROLLED');
      }
    }

    checkDeviceStatus();
  }, []);

  const handleEnrolled = (deviceData) => {
    setDeviceInfo(deviceData);
    setAppState('LOGIN');
  };

  const handleLoginSuccess = (data) => {
    setStudent(data.student);
    setSession(data.session);
    setToken(data.token);
    setLabInfo(data.lab);
    setAppState('HOME');
  };

  const handleLogout = async () => {
    try {
      if (window.desktopAPI?.session?.logout) {
        await window.desktopAPI.session.logout({
          sessionId: session?.id,
          token,
          reason: 'USER_LOGOUT',
        });
      }
    } catch (err) {
      console.warn('[DesktopApp] Logout error:', err.message);
    } finally {
      if (kioskActive && window.desktopAPI?.kiosk?.exit) {
        await window.desktopAPI.kiosk.exit();
        setKioskActive(false);
      }
      setStudent(null);
      setSession(null);
      setToken(null);
      setAppState('LOGIN');
    }
  };

  const handleLaunchWorkspace = (workspace) => {
    // Navigate to or open the cloud workspace
    const workspaceUrl = `/app/student/workspace/${workspace._id}`;
    window.location.href = workspaceUrl;
  };

  const handleLaunchExam = async (exam) => {
    try {
      // If exam requires kiosk/fullscreen, enter kiosk mode
      if (exam.requireFullscreen && window.desktopAPI?.kiosk?.enter) {
        await window.desktopAPI.kiosk.enter({ strictKiosk: true });
        setKioskActive(true);
      }
      // Redirect to exam session
      window.location.href = `/app/student/exams`;
    } catch (err) {
      console.error('[DesktopApp] Failed to launch exam in kiosk mode:', err);
    }
  };

  if (appState === 'LOADING') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (appState === 'UNENROLLED') {
    return <DeviceEnrollment onEnrolled={handleEnrolled} />;
  }

  if (appState === 'DISABLED') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-8 text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Workstation Temporarily Disabled</h2>
          <p className="text-xs text-slate-400 mt-2">
            This computer has been disabled by the laboratory administrator. Please contact your instructor.
          </p>
        </div>
      </div>
    );
  }

  if (appState === 'LOGIN') {
    return (
      <DesktopLogin
        deviceInfo={deviceInfo}
        labInfo={labInfo}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <LabHome
      deviceInfo={deviceInfo}
      labInfo={labInfo}
      student={student}
      session={session}
      token={token}
      onLaunchWorkspace={handleLaunchWorkspace}
      onLaunchExam={handleLaunchExam}
      onLogout={handleLogout}
    />
  );
}

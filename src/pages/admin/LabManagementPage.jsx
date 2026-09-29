import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Monitor,
  Search,
  Key,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import labService from '../../services/labService';
import LabCard from '../../components/lab/LabCard';
import DeviceTable from '../../components/lab/DeviceTable';
import EnrollmentTokenModal from '../../components/lab/EnrollmentTokenModal';

export default function LabManagementPage() {
  const [labs, setLabs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLab, setSelectedLab] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tokenLab, setTokenLab] = useState(null);
  const [activeTab, setActiveTab] = useState('labs'); // 'labs' | 'devices'

  // New Lab Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    building: '',
    room: '',
    capacity: 30,
    description: '',
    policies: {
      idleTimeoutMinutes: 30,
      allowExamWorkspace: true,
      allowTerminal: true,
      allowStudentExecution: true,
      clearLocalCacheOnLogout: true,
      disableDevTools: true,
      forceFullscreenForExams: true,
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [labsRes, devicesRes] = await Promise.all([
        labService.getLabs(),
        labService.getDevices(selectedLab ? { labId: selectedLab._id } : {}),
      ]);
      setLabs(labsRes.data || []);
      setDevices(devicesRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch laboratory records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLab]);

  const handleCreateLab = async (e) => {
    e.preventDefault();
    try {
      await labService.createLab(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        code: '',
        building: '',
        room: '',
        capacity: 30,
        description: '',
        policies: {
          idleTimeoutMinutes: 30,
          allowExamWorkspace: true,
          allowTerminal: true,
          allowStudentExecution: true,
          clearLocalCacheOnLogout: true,
          disableDevTools: true,
          forceFullscreenForExams: true,
        },
      });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEnableDevice = async (device) => {
    try {
      await labService.enableDevice(device.deviceId);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDisableDevice = async (device) => {
    try {
      await labService.disableDevice(device.deviceId);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForceLogout = async (device) => {
    if (!window.confirm(`Force logout active session on ${device.deviceName}?`)) return;
    try {
      await labService.forceLogoutDevice(device.deviceId);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRotateCredential = async (device) => {
    if (!window.confirm(`Rotate credentials for ${device.deviceName}? Client will need to be reconfigured.`)) return;
    try {
      await labService.rotateDeviceCredential(device.deviceId);
      alert(`Credentials rotated for ${device.deviceName}.`);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRevoke = async (device) => {
    if (!window.confirm(`Revoke registration for ${device.deviceName}? This cannot be undone.`)) return;
    try {
      await labService.revokeDevice(device.deviceId);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const totalDevices = devices.length;
  const activeSessions = devices.filter((d) => d.activeStudentId).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-400" />
            Computer Lab & Workstation Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Institutional access points, lab workstation provisioning, and remote policy enforcement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Computer Lab
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Labs</div>
            <div className="text-xl font-bold text-white mt-0.5">{labs.length}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Enrolled Workstations</div>
            <div className="text-xl font-bold text-white mt-0.5">{totalDevices}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Active Student Sessions</div>
            <div className="text-xl font-bold text-white mt-0.5">{activeSessions}</div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('labs')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'labs'
              ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Laboratories ({labs.length})
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'devices'
              ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Monitor className="w-4 h-4" />
          Workstations ({devices.length})
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'labs' ? (
        <div>
          {labs.length === 0 && !loading ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-800">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-200">No Laboratories Configured</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Create a computer laboratory profile to start enrolling institutional workstations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {labs.map((lab) => (
                <LabCard
                  key={lab._id}
                  lab={lab}
                  onGenerateToken={(l) => setTokenLab(l)}
                  onManageDevices={(l) => {
                    setSelectedLab(l);
                    setActiveTab('devices');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {selectedLab ? (
                <span>
                  Showing workstations for{' '}
                  <strong className="text-white">{selectedLab.name}</strong>{' '}
                  <button
                    onClick={() => setSelectedLab(null)}
                    className="text-indigo-400 hover:underline ml-2"
                  >
                    (View All Labs)
                  </button>
                </span>
              ) : (
                <span>Showing all enrolled workstations across all laboratories</span>
              )}
            </div>
            {selectedLab && (
              <button
                onClick={() => setTokenLab(selectedLab)}
                className="px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-500/20"
              >
                <Key className="w-3.5 h-3.5" />
                Enroll Workstation to {selectedLab.code}
              </button>
            )}
          </div>

          <DeviceTable
            devices={devices}
            onEnable={handleEnableDevice}
            onDisable={handleDisableDevice}
            onForceLogout={handleForceLogout}
            onRotateCredential={handleRotateCredential}
            onRevoke={handleRevoke}
          />
        </div>
      )}

      {/* Enrollment Token Modal */}
      {tokenLab && (
        <EnrollmentTokenModal lab={tokenLab} onClose={() => setTokenLab(null)} />
      )}

      {/* Create Lab Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-semibold text-lg text-white mb-4">Create Computer Laboratory</h3>
            <form onSubmit={handleCreateLab} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Lab Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Programming Lab"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LAB-CSE-204"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Building</label>
                  <input
                    type="text"
                    placeholder="e.g. Turing Hall"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Room</label>
                  <input
                    type="text"
                    placeholder="e.g. 204"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Laboratory description or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-300 block mb-1">Workstation Policies</span>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.policies.clearLocalCacheOnLogout}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        policies: {
                          ...formData.policies,
                          clearLocalCacheOnLogout: e.target.checked,
                        },
                      })
                    }
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                  />
                  <span>Auto-wipe student cache on logout</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.policies.disableDevTools}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        policies: {
                          ...formData.policies,
                          disableDevTools: e.target.checked,
                        },
                      })
                    }
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                  />
                  <span>Disable Developer Tools in Desktop Client</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.policies.allowExamWorkspace}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        policies: {
                          ...formData.policies,
                          allowExamWorkspace: e.target.checked,
                        },
                      })
                    }
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                  />
                  <span>Enable Exam Kiosk Mode</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Save Laboratory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

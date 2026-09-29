import React, { useState, useEffect } from 'react';
import { lmsService } from '../../../services/lmsService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  Layers,
  Plus,
  Search,
  BookOpen,
  User,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await lmsService.getDepartments();
      if (res.success) {
        setDepartments(res.departments || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    try {
      setSubmitting(true);
      if (editingDept) {
        await lmsService.updateDepartment(editingDept._id, formData);
        showNotification('Department updated successfully');
      } else {
        await lmsService.createDepartment(formData);
        showNotification('Department created successfully');
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      showNotification(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete ${dept.name} (${dept.code})?`)) {
      return;
    }

    try {
      await lmsService.deleteDepartment(dept._id);
      showNotification('Department deleted successfully');
      fetchDepartments();
    } catch (err) {
      showNotification(err.message || 'Could not delete department', 'error');
    }
  };

  const filtered = departments.filter((d) => {
    const s = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(s) ||
      d.code.toLowerCase().includes(s) ||
      (d.description && d.description.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between border ${
            notification.type === 'error'
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Academic Departments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize degree programs, faculty allocations, and curriculum tracks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDepartments}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleOpenCreate} className="gap-2 shadow-xs">
            <Plus className="w-4 h-4" />
            New Department
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by code or department name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Main Content List / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 rounded-xl bg-card border border-border animate-pulse p-5 space-y-4">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-12 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="text-sm font-semibold">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDepartments}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card space-y-3">
          <Layers className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-foreground">No Departments Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchTerm
              ? 'No departments match your search filter.'
              : 'Get started by creating your university’s first academic department.'}
          </p>
          {!searchTerm && (
            <Button size="sm" onClick={handleOpenCreate} className="mt-2">
              <Plus className="w-4 h-4 mr-1.5" />
              Create First Department
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((dept) => (
            <Card
              key={dept._id}
              className="p-5 flex flex-col justify-between hover:border-primary/40 transition-colors group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                    {dept.code}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      title="Edit Department"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(dept)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {dept.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium text-foreground">{dept.courseCount || 0}</span>
                  <span>Courses</span>
                </div>

                <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate">{dept.headOfDepartment?.name || 'Unassigned'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-fade-up">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-base">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Department Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE, AIDS, ECE"
                  value={formData.code}
                  disabled={!!editingDept} // Code stays unique key
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Academic scope, degree tracks, and department objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting
                    ? 'Saving...'
                    : editingDept
                    ? 'Save Changes'
                    : 'Create Department'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

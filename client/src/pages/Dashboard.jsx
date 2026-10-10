import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import PasswordCard from '../components/PasswordCard';
import PasswordFormModal from '../components/PasswordFormModal';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [adminStats, setAdminStats] = useState(null);

  // Debounce the search box so we don't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setError('');
      const { data } = await api.listPasswords(token, debouncedSearch);
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  // Role-based: only admins can see platform-wide stats
  useEffect(() => {
    if (user?.role !== 'admin') return;
    api.adminStats(token).then(setAdminStats).catch(() => {});
  }, [user, token]);

  const handleSave = async (payload) => {
    if (editing) await api.updatePassword(token, editing.id, payload);
    else await api.createPassword(token, payload);
    setModalOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await api.deletePassword(token, pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setModalOpen(true);
  };

  return (
    <div className="dashboard">
      <section className="dash-head">
        <div>
          <h1>My Vault</h1>
          <p className="muted">
            {entries.length} credential{entries.length !== 1 ? 's' : ''} — encrypted with AES-256-GCM at rest
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
          + Add credential
        </button>
      </section>

      {user?.role === 'admin' && adminStats && (
        <div className="banner admin-banner">
          🛡️ Admin view — {adminStats.users} registered users · {adminStats.entries} total stored credentials
        </div>
      )}

      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Search by website or username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search credentials"
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : entries.length === 0 ? (
        <div className="card empty">
          <p className="empty-emoji">🔒</p>
          <p>{debouncedSearch ? 'No credentials match your search.' : 'No credentials yet.'}</p>
          {!debouncedSearch && (
            <button className="btn btn-secondary" onClick={() => setModalOpen(true)}>
              Add your first credential
            </button>
          )}
        </div>
      ) : (
        <div className="entries-grid">
          {entries.map((entry) => (
            <PasswordCard key={entry.id} entry={entry} onEdit={openEdit} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      {modalOpen && (
        <PasswordFormModal
          entry={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}

      {pendingDelete && (
        <div className="modal-backdrop" onClick={() => setPendingDelete(null)}>
          <div className="modal card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Delete credential?</h2>
            <p>
              This permanently removes <strong>{pendingDelete.website}</strong> / {pendingDelete.username}. This action
              cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setPendingDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

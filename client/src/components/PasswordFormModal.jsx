import { useEffect, useState } from 'react';
import StrengthMeter from './StrengthMeter';
import { generatePassword } from '../utils/password';

export default function PasswordFormModal({ entry, onClose, onSave }) {
  const [website, setWebsite] = useState(entry?.website || '');
  const [username, setUsername] = useState(entry?.username || '');
  const [password, setPassword] = useState(entry?.password || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [showPassword, setShowPassword] = useState(false);
  const [genLength, setGenLength] = useState(16);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleGenerate = () => {
    setPassword(generatePassword(genLength));
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!website.trim() || !username.trim() || !password) {
      setError('Website, username and password are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave({ website: website.trim(), username: username.trim(), password, notes: notes.trim() });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{entry ? 'Edit credential' : 'Add credential'}</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Website</span>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="example.com" required maxLength={255} autoFocus />
          </label>

          <label className="field">
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your.username" required maxLength={255} />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button type="button" className="btn btn-small" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <StrengthMeter password={password} />

          <details className="generator">
            <summary>🎲 Generate a strong password</summary>
            <div className="generator-controls">
              <label className="field">
                <span>Length: {genLength}</span>
                <input
                  type="range"
                  min={8}
                  max={32}
                  value={genLength}
                  onChange={(e) => setGenLength(Number(e.target.value))}
                />
              </label>
              <button type="button" className="btn btn-secondary" onClick={handleGenerate}>
                Generate
              </button>
            </div>
          </details>

          <label className="field">
            <span>Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="Recovery info, hints…"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : entry ? 'Save changes' : 'Add credential'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

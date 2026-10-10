import { useState } from 'react';

export default function PasswordCard({ entry, onEdit, onDelete }) {
  const [revealed, setRevealed] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const copy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // Clipboard API unavailable (e.g. non-HTTPS) — ignore silently
    }
  };

  return (
    <article className="card entry-card">
      <div className="entry-head">
        <div className="avatar" aria-hidden="true">
          {entry.website.charAt(0).toUpperCase()}
        </div>
        <div className="entry-title">
          <h3>{entry.website}</h3>
          <p className="muted">{entry.username}</p>
        </div>
        <div className="entry-actions">
          <button className="btn btn-icon" title="Edit" aria-label={`Edit ${entry.website}`} onClick={() => onEdit(entry)}>
            ✏️
          </button>
          <button className="btn btn-icon" title="Delete" aria-label={`Delete ${entry.website}`} onClick={() => onDelete(entry)}>
            🗑️
          </button>
        </div>
      </div>

      <div className="entry-password">
        <code title={revealed ? entry.password : undefined}>{revealed ? entry.password : '••••••••••'}</code>
        <button className="btn btn-small" onClick={() => setRevealed((r) => !r)}>
          {revealed ? 'Hide' : 'Show'}
        </button>
        <button className="btn btn-small" onClick={() => copy(entry.password, 'password')}>
          {copiedField === 'password' ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {entry.notes && <p className="entry-notes">{entry.notes}</p>}

      <footer className="entry-foot muted">
        Updated {new Date(entry.updatedAt).toLocaleString()}
      </footer>
    </article>
  );
}

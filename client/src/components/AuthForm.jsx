import { useState } from 'react';

export default function AuthForm({ title, subtitle, submitLabel, error, busy, onSubmit, mode, children }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'register') onSubmit({ name, email, password });
    else onSubmit({ email, password });
  };

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <h1>{title}</h1>
      <p className="muted">{subtitle}</p>

      {error && <div className="alert alert-error">{error}</div>}

      {mode === 'register' && (
        <label className="field">
          <span>Full name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </label>
      )}

      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="••••••••"
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        />
      </label>

      {mode === 'register' && (
        <p className="hint">At least 8 characters. Passwords are hashed with bcrypt (12 rounds) before storage.</p>
      )}

      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? 'Working…' : submitLabel}
      </button>
      {children}
    </form>
  );
}

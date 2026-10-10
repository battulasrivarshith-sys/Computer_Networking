import { strengthInfo } from '../utils/password';

export default function StrengthMeter({ password }) {
  if (!password) return null;
  const info = strengthInfo(password);
  return (
    <div className="strength">
      <div className="strength-bar" aria-hidden="true">
        <div className={`strength-fill ${info.className}`} style={{ width: info.width }} />
      </div>
      <span className={`strength-label ${info.className}`}>{info.label}</span>
    </div>
  );
}

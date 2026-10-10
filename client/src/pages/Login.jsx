import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (values) => {
    setBusy(true);
    setError('');
    try {
      await login(values);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="page-center">
      <AuthForm
        title="Welcome back"
        subtitle="Sign in to your vault"
        submitLabel="Sign in"
        error={error}
        busy={busy}
        onSubmit={onSubmit}
      >
        <p className="form-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </AuthForm>
    </div>
  );
}

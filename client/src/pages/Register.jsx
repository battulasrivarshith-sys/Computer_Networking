import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (values) => {
    setBusy(true);
    setError('');
    try {
      await register(values);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="page-center">
      <AuthForm
        title="Create your account"
        subtitle="Your credentials stay encrypted and private"
        submitLabel="Create account"
        error={error}
        busy={busy}
        onSubmit={onSubmit}
        mode="register"
      >
        <p className="form-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </AuthForm>
    </div>
  );
}

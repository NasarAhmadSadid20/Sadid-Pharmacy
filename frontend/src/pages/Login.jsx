import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-xl font-bold">ورود به داروخانه سدید</h1>
          <p className="text-sm text-stone-500">نام کاربری و رمز عبور خود را وارد کنید</p>
        </div>
        <div>
          <label className="label">نام کاربری</label>
          <input className="input" value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div>
          <label className="label">رمز عبور</label>
          <input type="password" className="input" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        {error && <p className="text-sm text-alert">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'در حال ورود...' : 'ورود'}
        </button>
      </form>
    </div>
  );
}

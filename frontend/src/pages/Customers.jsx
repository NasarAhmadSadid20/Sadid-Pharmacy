import { useEffect, useState } from 'react';
import { api } from '../api.js';

const empty = { full_name: '', phone: '', national_id: '', address: '' };

export default function Customers() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try { setItems(await api(`/customers?q=${encodeURIComponent(q)}`)); }
    catch (e) { setError(e.message); }
  }

  useEffect(() => { load(); }, [q]);

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      if (form.id) await api(`/customers/${form.id}`, { method: 'PUT', body: form });
      else await api('/customers', { method: 'POST', body: form });
      setForm(null);
      load();
    } catch (e) { setError(e.message); }
  }

  async function remove(id) {
    if (!confirm('این مشتری حذف شود؟')) return;
    try { await api(`/customers/${id}`, { method: 'DELETE' }); load(); }
    catch (e) { setError(e.message); }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h1 className="text-2xl font-bold">مشتریان</h1>
        <button className="btn-primary" onClick={() => setForm(empty)}>افزودن مشتری</button>
      </div>
      <input className="input max-w-xs" placeholder="جستجو بر اساس نام یا تلفن..." value={q} onChange={(e) => setQ(e.target.value)} />
      {error && <p className="text-alert text-sm">{error}</p>}

      {form && (
        <form onSubmit={save} className="card grid md:grid-cols-2 gap-4">
          <div><label className="label">نام و نام خانوادگی *</label><input className="input" required value={form.full_name} onChange={set('full_name')} /></div>
          <div><label className="label">تلفن</label><input className="input" value={form.phone || ''} onChange={set('phone')} /></div>
          <div><label className="label">کد ملی</label><input className="input" value={form.national_id || ''} onChange={set('national_id')} /></div>
          <div><label className="label">آدرس</label><input className="input" value={form.address || ''} onChange={set('address')} /></div>
          <div className="md:col-span-2 flex gap-2">
            <button className="btn-primary">ذخیره</button>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>انصراف</button>
          </div>
        </form>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full min-w-[560px]">
          <thead className="bg-stone-50">
            <tr><th className="th">نام</th><th className="th">تلفن</th><th className="th">کد ملی</th><th className="th">آدرس</th><th className="th"></th></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-stone-50">
                <td className="td">{c.full_name}</td>
                <td className="td">{c.phone}</td>
                <td className="td">{c.national_id}</td>
                <td className="td">{c.address}</td>
                <td className="td whitespace-nowrap">
                  <button className="text-mint ml-3" onClick={() => setForm(c)}>ویرایش</button>
                  <button className="text-alert" onClick={() => remove(c.id)}>حذف</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td className="td text-center text-stone-500" colSpan={5}>مشتری‌ای یافت نشد.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

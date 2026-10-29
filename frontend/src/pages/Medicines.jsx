import { useEffect, useState } from 'react';
import { api, money, date } from '../api.js';

const empty = {
  code: '', name: '', generic_name: '', manufacturer: '', category: '',
  requires_prescription: false, unit_price: 0, stock_quantity: 0, reorder_level: 10, expiry_date: '',
};

export default function Medicines() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const params = new URLSearchParams({ q, filter });
      setItems(await api(`/medicines?${params}`));
    } catch (e) { setError(e.message); }
  }

  useEffect(() => { load(); }, [q, filter]);

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      const body = { ...form, unit_price: Number(form.unit_price), stock_quantity: Number(form.stock_quantity), reorder_level: Number(form.reorder_level) };
      if (form.id) await api(`/medicines/${form.id}`, { method: 'PUT', body });
      else await api('/medicines', { method: 'POST', body });
      setForm(null);
      load();
    } catch (e) { setError(e.message); }
  }

  async function remove(id) {
    if (!confirm('این دارو حذف شود؟')) return;
    try { await api(`/medicines/${id}`, { method: 'DELETE' }); load(); }
    catch (e) { setError(e.message); }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h1 className="text-2xl font-bold">داروها</h1>
        <button className="btn-primary" onClick={() => setForm(empty)}>افزودن دارو</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="جستجو بر اساس نام یا کد..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[12rem]" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">همه</option>
          <option value="low">کمبود موجودی</option>
          <option value="expiring">نزدیک به انقضا</option>
        </select>
      </div>

      {error && <p className="text-alert text-sm">{error}</p>}

      {form && (
        <form onSubmit={save} className="card grid md:grid-cols-3 gap-4">
          <div><label className="label">کد دارو *</label><input className="input" required value={form.code} onChange={set('code')} /></div>
          <div><label className="label">نام دارو *</label><input className="input" required value={form.name} onChange={set('name')} /></div>
          <div><label className="label">نام ژنریک</label><input className="input" value={form.generic_name || ''} onChange={set('generic_name')} /></div>
          <div><label className="label">تولیدکننده</label><input className="input" value={form.manufacturer || ''} onChange={set('manufacturer')} /></div>
          <div><label className="label">دسته‌بندی</label><input className="input" value={form.category || ''} onChange={set('category')} /></div>
          <div><label className="label">قیمت (ریال) *</label><input type="number" min="0" className="input" required value={form.unit_price} onChange={set('unit_price')} /></div>
          <div><label className="label">موجودی</label><input type="number" min="0" className="input" value={form.stock_quantity} onChange={set('stock_quantity')} /></div>
          <div><label className="label">حد سفارش مجدد</label><input type="number" min="0" className="input" value={form.reorder_level} onChange={set('reorder_level')} /></div>
          <div><label className="label">تاریخ انقضا</label><input type="date" className="input" value={form.expiry_date ? String(form.expiry_date).slice(0, 10) : ''} onChange={set('expiry_date')} /></div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={!!form.requires_prescription} onChange={set('requires_prescription')} />
            نیازمند نسخه پزشک
          </label>
          <div className="md:col-span-3 flex gap-2">
            <button className="btn-primary">ذخیره</button>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>انصراف</button>
          </div>
        </form>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full min-w-[720px]">
          <thead className="bg-stone-50">
            <tr>
              <th className="th">کد</th><th className="th">نام</th><th className="th">تولیدکننده</th>
              <th className="th">قیمت</th><th className="th">موجودی</th><th className="th">انقضا</th><th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => {
              const low = m.stock_quantity <= m.reorder_level;
              return (
                <tr key={m.id} className="hover:bg-stone-50">
                  <td className="td">{m.code}</td>
                  <td className="td">{m.name}{m.requires_prescription && <span className="mr-2 text-xs text-stone-500">(نسخه‌ای)</span>}</td>
                  <td className="td">{m.manufacturer}</td>
                  <td className="td">{money(m.unit_price)}</td>
                  <td className={`td font-medium ${low ? 'text-alert' : ''}`}>{m.stock_quantity}</td>
                  <td className="td">{date(m.expiry_date)}</td>
                  <td className="td whitespace-nowrap">
                    <button className="text-mint ml-3" onClick={() => setForm({ ...m, expiry_date: m.expiry_date ? String(m.expiry_date).slice(0, 10) : '' })}>ویرایش</button>
                    <button className="text-alert" onClick={() => remove(m.id)}>حذف</button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && <tr><td className="td text-center text-stone-500" colSpan={7}>دارویی یافت نشد.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

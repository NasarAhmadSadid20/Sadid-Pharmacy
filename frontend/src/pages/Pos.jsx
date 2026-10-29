import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

export default function Pos() {
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api('/medicines').then(setMedicines).catch((e) => setMessage({ type: 'error', text: e.message }));
    api('/customers').then(setCustomers).catch(() => {});
  }, []);

  const visible = medicines.filter((m) =>
    search && (m.name.includes(search) || m.code.includes(search) || (m.generic_name || '').toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 8);

  function addItem(m) {
    setMessage(null);
    setCart((c) => {
      const found = c.find((x) => x.medicine_id === m.id);
      if (found) return c.map((x) => (x.medicine_id === m.id ? { ...x, quantity: x.quantity + 1 } : x));
      return [...c, { medicine_id: m.id, name: m.name, unit_price: Number(m.unit_price), stock: m.stock_quantity, quantity: 1 }];
    });
    setSearch('');
  }

  function setQty(id, qty) {
    setCart((c) => c.map((x) => (x.medicine_id === id ? { ...x, quantity: Math.max(1, Number(qty) || 1) } : x)));
  }

  const subtotal = cart.reduce((s, x) => s + x.unit_price * x.quantity, 0);
  const payable = Math.max(0, subtotal - Number(discount || 0));

  async function checkout() {
    try {
      const sale = await api('/sales', {
        method: 'POST',
        body: {
          customer_id: customerId || null,
          items: cart.map((x) => ({ medicine_id: x.medicine_id, quantity: x.quantity })),
          discount: Number(discount || 0),
        },
      });
      setMessage({ type: 'ok', text: `فاکتور ${sale.invoice_no} با موفقیت ثبت شد.` });
      setCart([]);
      setDiscount(0);
      api('/medicines').then(setMedicines);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">صندوق فروش</h1>

      <div className="grid xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="card">
            <label className="label">جستجوی دارو (نام، نام ژنریک یا کد)</label>
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="مثلاً آموکسی‌سیلین" />
            {visible.length > 0 && (
              <ul className="mt-2 border rounded-md divide-y bg-white">
                {visible.map((m) => (
                  <li key={m.id}>
                    <button className="w-full flex justify-between px-3 py-2 hover:bg-mintsoft text-sm disabled:text-stone-400"
                      disabled={m.stock_quantity <= 0} onClick={() => addItem(m)}>
                      <span>{m.name}</span>
                      <span>{money(m.unit_price)} | موجودی: {m.stock_quantity}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr><th className="th">دارو</th><th className="th">قیمت</th><th className="th">تعداد</th><th className="th">جمع</th><th className="th"></th></tr>
              </thead>
              <tbody>
                {cart.map((x) => (
                  <tr key={x.medicine_id}>
                    <td className="td">{x.name}</td>
                    <td className="td">{money(x.unit_price)}</td>
                    <td className="td">
                      <input type="number" min="1" max={x.stock} className="input w-20 py-1" value={x.quantity}
                        onChange={(e) => setQty(x.medicine_id, e.target.value)} />
                    </td>
                    <td className="td">{money(x.unit_price * x.quantity)}</td>
                    <td className="td">
                      <button className="text-alert" onClick={() => setCart(cart.filter((c) => c.medicine_id !== x.medicine_id))}>حذف</button>
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && <tr><td className="td text-center text-stone-500" colSpan={5}>هنوز دارویی اضافه نشده است.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card space-y-4 h-fit">
          <div>
            <label className="label">مشتری (اختیاری)</label>
            <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">مشتری عمومی</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">تخفیف (ریال)</label>
            <input type="number" min="0" className="input" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
          <div className="border-t pt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>جمع کل</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between font-bold text-base"><span>قابل پرداخت</span><span>{money(payable)}</span></div>
          </div>
          <button className="btn-primary w-full" disabled={cart.length === 0} onClick={checkout}>ثبت فروش و صدور فاکتور</button>
          {message && (
            <p className={`text-sm ${message.type === 'ok' ? 'text-mint' : 'text-alert'}`}>{message.text}</p>
          )}
        </div>
      </div>
    </div>
  );
}

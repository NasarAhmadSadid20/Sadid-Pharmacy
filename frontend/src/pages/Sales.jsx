import { useEffect, useState } from 'react';
import { api, money, date } from '../api.js';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/sales').then(setSales).catch((e) => setError(e.message));
  }, []);

  async function open(id) {
    setDetail(await api(`/sales/${id}`));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">تاریخچه فروش</h1>
      {error && <p className="text-alert text-sm">{error}</p>}

      {detail && (
        <div className="card space-y-3">
          <div className="flex justify-between">
            <div>
              <div className="font-bold">فاکتور {detail.invoice_no}</div>
              <div className="text-sm text-stone-500">
                {date(detail.created_at)} | مشتری: {detail.customer_name || 'عمومی'} | فروشنده: {detail.seller_name}
              </div>
            </div>
            <button className="btn-ghost h-fit" onClick={() => setDetail(null)}>بستن</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr><th className="th">دارو</th><th className="th">تعداد</th><th className="th">قیمت واحد</th><th className="th">جمع</th></tr></thead>
            <tbody>
              {detail.items.map((i) => (
                <tr key={i.id}>
                  <td className="td">{i.medicine_name}</td><td className="td">{i.quantity}</td>
                  <td className="td">{money(i.unit_price)}</td><td className="td">{money(i.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-sm">تخفیف: {money(detail.discount)} | پرداختی: {money(detail.paid_amount)} | مبلغ فاکتور: <b>{money(detail.total_amount)}</b></div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full min-w-[640px]">
          <thead className="bg-stone-50">
            <tr><th className="th">شماره فاکتور</th><th className="th">تاریخ</th><th className="th">مشتری</th><th className="th">مبلغ</th><th className="th"></th></tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="hover:bg-stone-50">
                <td className="td">{s.invoice_no}</td>
                <td className="td">{date(s.created_at)}</td>
                <td className="td">{s.customer_name || 'عمومی'}</td>
                <td className="td">{money(s.total_amount)}</td>
                <td className="td"><button className="text-mint" onClick={() => open(s.id)}>مشاهده</button></td>
              </tr>
            ))}
            {sales.length === 0 && <tr><td className="td text-center text-stone-500" colSpan={5}>فروشی ثبت نشده است.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

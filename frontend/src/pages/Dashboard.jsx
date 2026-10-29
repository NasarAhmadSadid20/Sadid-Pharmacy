import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money, date } from '../api.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/dashboard/summary').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-alert">{error}</p>;
  if (!data) return <p>در حال بارگذاری...</p>;

  const stats = [
    { label: 'تعداد داروها', value: data.total_medicines },
    { label: 'ارزش موجودی', value: money(data.stock_value) },
    { label: 'فروش امروز (فاکتور)', value: data.today_sales_count },
    { label: 'جمع فروش امروز', value: money(data.today_sales_total) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">داشبورد</h1>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="text-sm text-stone-500">{s.label}</div>
            <div className="text-xl font-bold mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-bold mb-3 text-alert">کمبود موجودی</h2>
          {data.low_stock.length === 0 ? <p className="text-sm text-stone-500">موردی وجود ندارد.</p> : (
            <ul className="divide-y">
              {data.low_stock.map((m) => (
                <li key={m.id} className="py-2 flex justify-between text-sm">
                  <Link to="/medicines" className="hover:underline">{m.name}</Link>
                  <span>{m.stock_quantity} از {m.reorder_level}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="font-bold mb-3 text-alert">نزدیک به انقضا (۶۰ روز)</h2>
          {data.expiring.length === 0 ? <p className="text-sm text-stone-500">موردی وجود ندارد.</p> : (
            <ul className="divide-y">
              {data.expiring.map((m) => (
                <li key={m.id} className="py-2 flex justify-between text-sm">
                  <Link to="/medicines" className="hover:underline">{m.name}</Link>
                  <span>{date(m.expiry_date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

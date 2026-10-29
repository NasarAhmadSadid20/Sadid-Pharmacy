import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'داشبورد' },
  { to: '/pos', label: 'صندوق فروش' },
  { to: '/medicines', label: 'داروها' },
  { to: '/sales', label: 'تاریخچه فروش' },
  { to: '/customers', label: 'مشتریان' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-60 bg-ink text-paper md:min-h-screen p-5 flex md:flex-col gap-4 md:gap-2">
        <div className="font-bold text-xl md:mb-6">داروخانه سدید</div>
        <nav className="flex md:flex-col gap-1 flex-wrap">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-mint text-white' : 'hover:bg-white/10'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="md:mt-auto text-sm text-stone-300">
          <div>{user?.full_name}</div>
          <button
            className="mt-2 underline hover:text-white"
            onClick={() => { logout(); navigate('/login'); }}
          >
            خروج از حساب
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}

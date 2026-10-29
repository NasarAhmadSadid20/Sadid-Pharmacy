import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Medicines from './pages/Medicines.jsx';
import Pos from './pages/Pos.jsx';
import Sales from './pages/Sales.jsx';
import Customers from './pages/Customers.jsx';

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/pos" element={<Pos />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/customers" element={<Customers />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

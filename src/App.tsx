import {HashRouter, Navigate, Route, Routes} from 'react-router-dom';
import {StoreProvider, useStore} from '@/store';
import Shell from '@/components/Shell';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import Products from '@/pages/Products';
import Customers from '@/pages/Customers';
import Analytics from '@/pages/Analytics';
import Inventory from '@/pages/Inventory';
import Marketing from '@/pages/Marketing';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';

function Protected({children}: {children: React.ReactNode}) {
  const {authed} = useStore();
  if (!authed) return <Navigate to="/login" replace/>;
  return <Shell>{children}</Shell>;
}

function Gate() {
  const {authed} = useStore();
  if (!authed) return <Navigate to="/login" replace/>;
  return <Navigate to="/" replace/>;
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginGate/>}/>
          <Route path="/" element={<Protected><Dashboard/></Protected>}/>
          <Route path="/orders" element={<Protected><Orders/></Protected>}/>
          <Route path="/products" element={<Protected><Products/></Protected>}/>
          <Route path="/customers" element={<Protected><Customers/></Protected>}/>
          <Route path="/analytics" element={<Protected><Analytics/></Protected>}/>
          <Route path="/inventory" element={<Protected><Inventory/></Protected>}/>
          <Route path="/marketing" element={<Protected><Marketing/></Protected>}/>
          <Route path="/reports" element={<Protected><Reports/></Protected>}/>
          <Route path="/settings" element={<Protected><Settings/></Protected>}/>
          <Route path="*" element={<Gate/>}/>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}

function LoginGate() {
  const {authed} = useStore();
  if (authed) return <Navigate to="/" replace/>;
  return <Login/>;
}

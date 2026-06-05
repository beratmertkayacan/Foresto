import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import AppChrome from './components/layout/AppChrome.jsx'
import RouteFadeLayout from './components/layout/RouteFadeLayout.jsx'
import Layout from './components/layout/Layout'
import { PrivateRoute, PublicRoute } from './components/auth/PrivateRoute'
import AuthResolvingScreen from './components/common/AuthResolvingScreen.jsx'
import Dashboard from './pages/dashboard/Dashboard'
import Urunler from './pages/inventory/Urunler'
import Hareketler from './pages/movements/Hareketler'
import Tahmin from './pages/analytics/Tahmin'
import EOQ from './pages/analytics/EOQ'
import StokRaporlar from './pages/analytics/StokRaporlar'
import Login from './pages/auth/Login'
import NotFound from './pages/common/NotFound'

function AppRoutes() {
  const { ready } = useAuth()

  if (!ready) {
    return <AuthResolvingScreen />
  }

  return (
    <Routes>
      <Route element={<RouteFadeLayout />}>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/urunler" element={<PrivateRoute><Layout><Urunler /></Layout></PrivateRoute>} />
        <Route path="/hareketler" element={<PrivateRoute><Layout><Hareketler /></Layout></PrivateRoute>} />
        <Route path="/analitik" element={<PrivateRoute><Navigate to="/analitik/tahmin" replace /></PrivateRoute>} />
        <Route path="/analitik/tahmin" element={<PrivateRoute><Layout><Tahmin /></Layout></PrivateRoute>} />
        <Route path="/analitik/eoq" element={<PrivateRoute><Layout><EOQ /></Layout></PrivateRoute>} />
        <Route path="/analitik/stok" element={<PrivateRoute><Layout><StokRaporlar /></Layout></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppChrome>
          <AppRoutes />
        </AppChrome>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

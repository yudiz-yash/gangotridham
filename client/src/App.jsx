import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Header      from './components/Header';
import Footer      from './components/Footer';
import KapatBanner from './components/KapatBanner';
import ScrollTop   from './components/ScrollTop';

import Home     from './pages/Home';
import Events   from './pages/Events';
import Booking  from './pages/Booking';
import Contact  from './pages/Contact';

import AdminLogin    from './pages/admin/AdminLogin';
import AdminLayout   from './pages/admin/AdminLayout';
import Dashboard     from './pages/admin/Dashboard';
import ManageEvents  from './pages/admin/ManageEvents';
import ManageBookings from './pages/admin/ManageBookings';
import ManageKapat   from './pages/admin/ManageKapat';
import ManageContact from './pages/admin/ManageContact';
import ManageGallery  from './pages/admin/ManageGallery';
import ManageHomepage from './pages/admin/ManageHomepage';

function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="spinner-center"><div className="spinner spinner-lg" /></div>;
  return user ? children : <Navigate to="/admin/login" replace />;
}

function PublicLayout() {
  return (
    <>
      <KapatBanner />
      <Header />
      <main>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/events"  element={<Events />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
      <ScrollTop />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route index              element={<Dashboard />} />
                  <Route path="events"      element={<ManageEvents />} />
                  <Route path="bookings"    element={<ManageBookings />} />
                  <Route path="kapat"       element={<ManageKapat />} />
                  <Route path="contact"     element={<ManageContact />} />
                  <Route path="gallery"     element={<ManageGallery />} />
                  <Route path="homepage"    element={<ManageHomepage />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/*" element={<PublicLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StripeProvider } from './contexts/StripeContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Application from './pages/Application';
import ApplicationView from './pages/ApplicationView';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Lease from './pages/Lease';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ContactForm from './components/ContactForm';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin/login" />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/admin/login" />;
  }
  
  return children;
};

// App Routes
const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Dashboard />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/application" 
        element={
          <ProtectedRoute>
            <Application />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/application/:id" 
        element={
          <ProtectedRoute>
            <ApplicationView />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payment" 
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payment/success" 
        element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payment/cancel" 
        element={
          <ProtectedRoute>
            <PaymentCancel />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/lease" 
        element={
          <ProtectedRoute>
            <Lease />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/contact" 
        element={<ContactForm />} 
      />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route 
        path="/admin/login" 
        element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} 
      />
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } 
      />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <StripeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <AppRoutes />
            </main>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </StripeProvider>
    </AuthProvider>
  );
}

export default App;

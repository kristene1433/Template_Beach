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
import Payment from './pages/Payment';
import Lease from './pages/Lease';
import Profile from './pages/Profile';

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
            <Dashboard />
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
        path="/payment" 
        element={
          <ProtectedRoute>
            <Payment />
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
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
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

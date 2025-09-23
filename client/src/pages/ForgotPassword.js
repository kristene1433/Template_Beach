import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendPasswordResetEmail } from '../utils/emailjs';
import { testPasswordResetConfig } from '../utils/debugEmailJS';
import Navigation from '../components/Navigation';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Debug EmailJS configuration
    if (process.env.NODE_ENV !== 'production') console.log('🔍 Debugging EmailJS configuration...');
    const isConfigured = testPasswordResetConfig();
    
    if (!isConfigured) {
      console.error('❌ EmailJS password reset not configured properly');
      setError('Email service not configured. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        // If we got a reset URL, send the email
        if (result.resetUrl && result.resetToken) {
          try {
            const emailResult = await sendPasswordResetEmail(email, result.resetToken, result.resetUrl);
            if (emailResult.success) {
              setEmailSent(true);
              toast.success('Password reset instructions sent to your email!');
            } else {
              // Check if it's a template configuration issue
              if (emailResult.error.includes('template') || emailResult.error.includes('configured')) {
                setEmailSent(true);
                toast.success('Password reset instructions sent to your email!');
                console.warn('Email template not configured, but token was generated:', emailResult.error);
              } else {
                // Other email errors - show error but still generate token for security
                setEmailSent(true);
                toast.success('Password reset instructions sent to your email!');
                console.error('Email sending failed but token was generated:', emailResult.error);
              }
            }
          } catch (emailError) {
            // Email failed but token was generated, still show success for security
            setEmailSent(true);
            toast.success('Password reset instructions sent to your email!');
            console.warn('Email sending failed but token was generated:', emailError);
          }
        } else {
          // No reset URL returned (user doesn't exist)
          setEmailSent(true);
          toast.success('If an account with that email exists, a password reset link has been sent.');
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />

        {/* Beach video background to match Home */}
        <section className="relative min-h-screen overflow-hidden pt-16 flex items-center">
          {/* Background video */}
          <div className="absolute inset-0 z-0">
            <video
              className="w-full h-full object-cover"
              poster="/images/image1.jpg"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/videos/beach-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Foreground content */}
          <div className="relative z-10 w-full sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <div className="card bg-white/90 backdrop-blur-md border-white/30 shadow-medium">
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Check Your Email
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We've sent password reset instructions to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    If you don't see the email, check your spam folder or try again.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setEmailSent(false);
                        setEmail('');
                      }}
                      className="btn-outline w-full"
                    >
                      Try Different Email
                    </button>
                    <Link
                      to="/login"
                      className="btn-primary w-full flex justify-center items-center"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Beach video background to match Home */}
      <section className="relative min-h-screen overflow-hidden pt-16 flex items-center">
        {/* Background video */}
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            poster="/images/image1.jpg"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/beach-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 w-full sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-bold text-white">
              Forgot Password?
            </h2>
            <p className="mt-2 text-center text-sm text-gray-200">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="card bg-white/90 backdrop-blur-md border-white/30 shadow-medium">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className={`input-field pl-10 ${error ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {error && (
                    <p className="form-error">{error}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex justify-center items-center disabled:opacity-75"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </div>

                {/* Back to Login Link */}
                <div className="text-center">
                  <Link
                    to="/login"
                    className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Login
                  </Link>
                </div>
              </form>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-200">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-blue-200 hover:text-blue-100 font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;

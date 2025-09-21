import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Phone, User, MessageSquare, Send } from 'lucide-react';
import { sendContactEmail, initEmailJS } from '../utils/emailjs';

const ContactForm = () => {
  const [loading, setLoading] = useState(false);
  const [emailjsReady, setEmailjsReady] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Initialize EmailJS
  useEffect(() => {
    const initializeEmailJS = async () => {
      try {
        await initEmailJS();
        setEmailjsReady(true);
        console.log('✅ EmailJS initialized for contact form');
      } catch (error) {
        console.error('❌ EmailJS initialization failed:', error);
        setEmailjsReady(false);
      }
    };

    initializeEmailJS();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!emailjsReady) {
      toast.error('Email service is not ready. Please try again in a moment.');
      return;
    }

    setLoading(true);
    
    try {
      const result = await sendContactEmail(formData);

      if (result.success) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        console.error('❌ Contact email failed:', result.error);
        if (!result.error.includes('template') && !result.error.includes('configured')) {
          toast.error('Failed to send message. Please try again or contact us directly.');
        } else {
          console.log('📧 Contact email skipped - template not configured');
          toast.error('Contact service temporarily unavailable. Please email us directly at palmrunbeachcondo@gmail.com');
        }
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('An error occurred while sending your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden pt-16 flex items-start md:items-center">
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video className="w-full h-full object-cover" poster="/images/image1.jpg" autoPlay muted loop playsInline>
          <source src="/videos/beach-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white">Contact Us</h2>
            <p className="text-gray-200 mt-2">
              Have a question? Need assistance? Send us a message and we'll get back to you promptly.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-white/30 rounded-lg p-6 shadow-medium">
            {/* Notice about EmailJS contact */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Direct Contact:</strong> Your message will be sent directly to our team via EmailJS. 
                We'll respond to your email address within 24 hours.
              </p>
            </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="your.email@example.com"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="input-field"
              placeholder="What's this about?"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="input-field pl-10"
              placeholder="Tell us how we can help you..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-center text-sm text-gray-600">
          <p>You can also reach us directly at:</p>
          <div className="mt-2 space-y-1">
            <p className="flex items-center justify-center">
              <Mail className="h-4 w-4 mr-2" />
              <a href="mailto:palmrunbeachcondo@gmail.com" className="text-primary-600 hover:text-primary-700">
                palmrunbeachcondo@gmail.com
              </a>
            </p>
            <p className="flex items-center justify-center">
              <Phone className="h-4 w-4 mr-2" />
              <a href="tel:+14076871270" className="text-primary-600 hover:text-primary-700">
                (407) 687-1270
              </a>
            </p>
          </div>
        </div>
      </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

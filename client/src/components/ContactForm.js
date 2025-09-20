import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Phone, User, MessageSquare, Send } from 'lucide-react';
// Contact email functionality removed - using direct email link instead

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create mailto link with form data
    const subject = encodeURIComponent(formData.subject || `Contact from ${formData.name}`);
    const body = encodeURIComponent(`
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}

Message:
${formData.message}
    `);
    
    const mailtoLink = `mailto:palmrunbeachcondo@gmail.com?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message
    toast.success('Opening your email client... Please send the email to contact us.');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
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
            {/* Notice about email client */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> This form will open your email client with a pre-filled message. 
                Simply send the email to contact us directly.
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
            className="btn-primary inline-flex items-center px-6 py-3"
          >
            <Send className="mr-2 h-5 w-5" />
            Open Email Client
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

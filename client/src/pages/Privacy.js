import React from 'react';
import Navigation from '../components/Navigation';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navigation />

      {/* Beach hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video className="w-full h-64 md:h-60 object-cover object-center" poster="/images/image1.jpg" autoPlay muted loop playsInline>
            <source src="/videos/beach-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            <p className="text-gray-200 mt-2">Your privacy matters to Palm Run LLC.</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="py-4 md:py-8 -mt-2 md:mt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl shadow-medium p-6 space-y-6">
            <p className="text-sm text-gray-600">Effective date: September 2025</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Information We Collect</h2>
              <p className="text-gray-700">
                We collect information you provide directly to us, such as name, email, phone number, 
                application details, and payment-related information processed by our provider (Stripe). 
                We also collect limited technical data like IP address and device/browser details to keep the site secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">How We Use Information</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Process rental applications and manage tenant accounts</li>
                <li>Facilitate payments and send confirmations/receipts</li>
                <li>Communicate about your application, lease, and support requests</li>
                <li>Improve site functionality, security, and reliability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sharing</h2>
              <p className="text-gray-700">
                We do not sell your personal information. We share data only with service providers who 
                help us operate the site (e.g., Stripe for payments, EmailJS for messaging) and only as necessary to provide services. 
                We may disclose information to comply with legal obligations or to protect our rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Security & Retention</h2>
              <p className="text-gray-700">
                We use industry-standard safeguards and retain information only as long as needed for business or legal purposes. 
                Payment details are handled by Stripe and are not stored on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Choices</h2>
              <p className="text-gray-700">
                You can request access, updates, or deletion of certain information by contacting us. 
                Some requests may be limited by legal or contractual requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact</h2>
              <p className="text-gray-700">
                Questions about this policy? Email us at <a className="text-blue-600" href="mailto:palmrunbeachcondo@gmail.com">palmrunbeachcondo@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;


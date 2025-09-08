import React from 'react';
import Navigation from '../components/Navigation';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Beach hero */}
      <section className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <video className="w-full h-40 md:h-56 object-cover" poster="/images/image1.jpg" autoPlay muted loop playsInline>
            <source src="/videos/beach-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            <p className="text-gray-200 mt-2">Please read these terms carefully.</p>
          </div>
        </div>
      </section>

      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl shadow-medium p-6 space-y-6">
            <p className="text-sm text-gray-600">Effective date: September 2025</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Use of the Site</h2>
              <p className="text-gray-700">
                Palm Run LLC provides an online portal to submit rental applications, manage leases, and make payments. 
                You agree to use the site only for lawful purposes and to provide accurate information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Accounts</h2>
              <p className="text-gray-700">
                You are responsible for maintaining the confidentiality of your account credentials and for any activity under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payments</h2>
              <p className="text-gray-700">
                Payments are processed by Stripe and subject to Stripe's terms. Fees and amounts due will be displayed before checkout.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Content and Intellectual Property</h2>
              <p className="text-gray-700">
                The site design, text, and graphics are owned by Palm Run LLC or licensed to us and may not be copied or reused without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Disclaimer</h2>
              <p className="text-gray-700">
                The site is provided "as is" without warranties of any kind. We are not liable for indirect or consequential damages to the maximum extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Changes</h2>
              <p className="text-gray-700">
                We may update these terms from time to time. Updates will be posted on this page with a new effective date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact</h2>
              <p className="text-gray-700">
                Questions about these terms? Email <a className="text-blue-600" href="mailto:palmrunbeachcondo@gmail.com">palmrunbeachcondo@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;


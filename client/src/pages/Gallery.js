import React from 'react';
import Navigation from '../components/Navigation';

const images = [
  {
    key: 'patio',
    title: 'Patio • Gulf of Mexico',
    src: '/images/patio.jpg',
    fallback: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'kitchen',
    title: 'Kitchen',
    src: '/images/kitchen.jpg',
    fallback: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'living',
    title: 'Living Room',
    src: '/images/livingroom.jpg',
    fallback: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c003?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'bed1',
    title: 'Bedroom 1',
    src: '/images/bedroom1.jpg',
    fallback: 'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d8b?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'bed2',
    title: 'Bedroom 2',
    src: '/images/bedroom2.jpg',
    fallback: 'https://images.unsplash.com/photo-1521782462922-9318be1a1e8b?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'bath1',
    title: 'Bathroom 1',
    src: '/images/bathroom1.jpg',
    fallback: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'bath2',
    title: 'Bathroom 2',
    src: '/images/bathroom2.jpg',
    fallback: 'https://images.unsplash.com/photo-1584624272454-98a70b1a308c?q=80&w=1600&auto=format&fit=crop'
  }
];

const Gallery = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <video className="w-full h-40 md:h-56 object-cover" poster="/images/image1.jpg" autoPlay muted loop playsInline>
            <source src="/videos/beach-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-white">Photo Gallery</h1>
            <p className="text-gray-200 mt-2">A peek inside and out — patio views and cozy interiors.</p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <figure key={img.key} className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl shadow-medium overflow-hidden">
                <img
                  src={img.src}
                  alt={img.title}
                  loading="lazy"
                  className="w-full h-60 object-cover hover:scale-[1.02] transition-transform duration-200"
                  onError={(e) => {
                    if (e.currentTarget.dataset.fallbackUsed) return;
                    e.currentTarget.src = img.fallback;
                    e.currentTarget.dataset.fallbackUsed = 'true';
                  }}
                />
                <figcaption className="p-4 text-sm text-gray-700 font-medium">{img.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;


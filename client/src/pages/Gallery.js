import React, { useState } from 'react';
import Navigation from '../components/Navigation';

const VER = 'v=7';
const images = [
  {
    key: 'patio',
    title: 'Patio • Gulf of Mexico',
    src: `/images/patio.jpg?${VER}`,
    fallback: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'kitchen',
    title: 'Kitchen',
    src: `/images/kitchen.jpg?${VER}`,
    fallback: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'living',
    title: 'Living Room',
    src: `/images/livingroom.jpg?${VER}`,
    fallback: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c003?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'bed1',
    title: 'Bedroom 1',
    src: `/images/bedroom1.jpg?${VER}`,
    fallback: 'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d8b?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'bed2',
    title: 'Bedroom 2',
    src: `/images/bedroom2.jpg?${VER}`,
    fallback: 'https://images.unsplash.com/photo-1521782462922-9318be1a1e8b?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'bath1',
    title: 'Bathroom 1',
    src: `/images/bathroom1.jpg?${VER}`,
    fallback: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'bath2',
    title: 'Bathroom 2',
    src: `/images/bathroom2.jpg?${VER}`,
    fallback: 'https://images.unsplash.com/photo-1584624272454-98a70b1a308c?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'condoFront',
    title: 'Condo Front View',
    src: `/images/condoFront.jpeg?${VER}`,
    fallback: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'condoBack',
    title: 'Condo Back View',
    src: `/images/condoBack.jpeg?${VER}`,
    fallback: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'dining',
    title: 'Dining Area',
    src: `/images/dining.jpg?${VER}`,
    fallback: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'appliance',
    title: 'Modern Appliances',
    src: `/images/appliance.jpg?${VER}`,
    fallback: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1600&auto=format&fit=crop'
  },
  {
    key: 'pool',
    title: 'Pool Area',
    src: `/images/pool.jpg?${VER}`,
    fallback: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1600&auto=format&fit=crop'
  }
];

// Custom Image component with fallback handling
const ImageWithFallback = ({ src, fallback, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};

const Gallery = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <video 
            className="w-full h-64 md:h-56 object-cover" 
            poster="/images/image1.jpg" 
            autoPlay 
            muted 
            loop 
            playsInline
            onError={(e) => console.error('Video failed to load:', e)}
            onLoadStart={() => console.log('Video loading started')}
            onCanPlay={() => console.log('Video can play')}
          >
            <source src="/videos/beach-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
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
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <figure key={img.key} className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl shadow-medium overflow-hidden">
                <ImageWithFallback
                  src={img.src}
                  fallback={img.fallback}
                  alt={img.title}
                  loading="eager"
                  fetchpriority="high"
                  decoding="async"
                  width="1200"
                  height="800"
                  className="w-full h-60 object-cover hover:scale-[1.02] transition-transform duration-200"
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

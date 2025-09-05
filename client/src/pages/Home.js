import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star,
  Phone,
  Mail,
  MapPin,
  Heart,
  Bed,
  Bath,
  Users,
  Square,
  Waves,
  Building2,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  ArrowRight,
  CheckCircle,
  Calendar,
  Wifi,
  Car,
  Coffee,
  Waves as Water,
  TreePine,
  Mountain
} from 'lucide-react';

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Terry and Linda T.',
      rating: 5,
      date: '2023-04-11',
      title: 'Beautiful Condo with Sun, Sand and Surf',
      content: 'We stayed for the entire month of March. Second floor, mid-building, convenient to elevator, pool, community room, and quick beach access. 2 good-sized bedrooms and baths with plenty of storage. We could turn off AC, open a large window facing the beach, and fall asleep to the sound of the surf.',
      verified: true,
      stayed: 'March 2023',
      expanded: false
    },
    {
      id: 2,
      name: 'Lourdes T.',
      rating: 5,
      date: '2025-08-07',
      title: 'What a fabulous experience!',
      content: 'Everything was perfect! Location, Owners, Access to the beach and pool. From the moment you walk in you can sense the love the owners have put into their property. The kitchen is fully stocked, their washer/dryer combo is state of the art, the beds are great.',
      verified: true,
      stayed: 'September 2025',
      expanded: false
    },
    {
      id: 3,
      name: 'Jill H.',
      rating: 5,
      date: '2025-03-13',
      title: 'WONDERFUL PLACE!',
      content: 'I had a wonderful stay at this beautiful condo and the hosts were fantastic! The condo had everything you can possibly need without bringing it from home! It\'s located on the 2nd floor which is convenient to both the elevator and the stairs.',
      verified: true,
      stayed: 'October 2024',
      expanded: false
    }
  ]);

  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    title: '',
    content: '',
    stayed: ''
  });

  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (newReview.name && newReview.content && newReview.title) {
      const review = {
        id: Date.now(),
        name: newReview.name,
        rating: newReview.rating,
        date: new Date().toISOString().split('T')[0],
        title: newReview.title,
        content: newReview.content,
        stayed: newReview.stayed || 'Recent',
        verified: false,
        expanded: false
      };
      setReviews([review, ...reviews]);
      setNewReview({ name: '', rating: 5, title: '', content: '', stayed: '' });
      setShowReviewForm(false);
    }
  };

  const toggleReviewExpansion = (reviewId) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, expanded: !review.expanded }
        : review
    ));
  };

  const propertyFeatures = [
    { icon: Bed, label: '2 Bedrooms' },
    { icon: Bath, label: '2 Bathrooms' },
    { icon: Users, label: 'Sleeps 4' },
    { icon: Square, label: '1000 sq ft' },
    { icon: Building2, label: 'Community Pool' },
    { icon: Waves, label: 'Gulf Front View' }
  ];

  const amenities = [
    { icon: Waves, label: 'Beach Access' },
    { icon: Building2, label: 'Community Center' },
    { icon: Coffee, label: 'Fully Equipped Kitchen' },
    { icon: Car, label: 'Dedicated Parking' },
    { icon: Calendar, label: 'Flexible Check-in' },
    { icon: Heart, label: 'Pet Friendly' }
  ];

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  <span className="text-green-600">Palm</span> Run
                </h1>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/" className="text-gray-900 hover:text-green-600 px-3 py-2 text-sm font-medium">Home</Link>
                <Link to="/application" className="text-gray-600 hover:text-green-600 px-3 py-2 text-sm font-medium">Apply</Link>
                <Link to="/login" className="text-gray-600 hover:text-green-600 px-3 py-2 text-sm font-medium">Login</Link>
                <Link to="/contact" className="text-gray-600 hover:text-green-600 px-3 py-2 text-sm font-medium">Contact</Link>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 text-gray-900 hover:text-green-600">Home</Link>
              <Link to="/application" className="block px-3 py-2 text-gray-600 hover:text-green-600">Apply</Link>
              <Link to="/login" className="block px-3 py-2 text-gray-600 hover:text-green-600">Login</Link>
              <Link to="/contact" className="block px-3 py-2 text-gray-600 hover:text-green-600">Contact</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/image1.jpg"
            alt="Gulf Shores Beachfront Condo"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
            }}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Gulf Shores
            <span className="block text-blue-300">Beachfront Condo</span>
            <span className="block text-blue-300">Indian Shores, FL</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            where luxury meets the ocean
          </p>
          <Link
            to="/register"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200"
          >
            APPLY NOW
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              retreat
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              You don't have to travel far to get lost in paradise. Enjoy stunning Gulf views paired with top-notch beachfront living just steps from the sugar-white sands of Indian Shores.
            </p>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              unplug
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get away from the hustle and bustle and come sleep to the sound of the surf...in a luxurious beachfront condo with modern amenities.
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              recharge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Take a quiet stroll along the beach at sunrise or enjoy a sunset swim in the community pool. Perfect for all-year-round entertainment with tons of activities along the coast.
            </p>
          </div>
        </div>
      </section>

      {/* Property Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Beachfront Condo Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of modern comfort and oceanfront living
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
            {propertyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {feature.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {amenities.map((amenity, index) => {
              const Icon = amenity.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {amenity.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Guests Say
            </h2>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-6 h-6 ${i < Math.round(averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-lg text-gray-600">{averageRating.toFixed(1)} from {reviews.length} reviews</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-600 mb-4 text-sm">
                  {review.expanded 
                    ? `"${review.content}"`
                    : `"${review.content.length > 120 ? review.content.substring(0, 120) + '...' : review.content}"`
                  }
                </p>
                
                {review.content.length > 120 && (
                  <button
                    onClick={() => toggleReviewExpansion(review.id)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium mb-4 flex items-center"
                  >
                    {review.expanded ? (
                      <>
                        Show Less <ChevronUp className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Read More <ChevronDown className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{review.name}</div>
                    <div className="text-sm text-gray-500">Stayed: {review.stayed}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience Beachfront Luxury?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Apply for your perfect beachfront condo and create memories that will last a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 inline-flex items-center justify-center"
            >
              Apply Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 inline-flex items-center justify-center"
            >
              Tenant Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">
                <span className="text-blue-400">Palm</span> Run
              </h3>
              <p className="text-gray-400 mb-4 max-w-md">
                Gulf Shores beachfront condo in Indian Shores, FL. Experience luxury oceanfront living with modern amenities and breathtaking Gulf views.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/application" className="text-gray-400 hover:text-white transition-colors">Apply</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>palmrunbeachcondo@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>(407) 687-1270</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>18650 Gulf Blvd Unit 207<br />Indian Shores, FL 33785</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Palm Run LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

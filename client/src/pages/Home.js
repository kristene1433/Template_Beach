import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { 
  Star,
  Bed,
  Bath,
  Users,
  Square,
  Waves,
  Building2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Car,
  Coffee,
  Settings
} from 'lucide-react';

const Home = () => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [reviews, setReviews] = useState([
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
    },
    {
      id: 4,
      name: 'Kathy V.',
      rating: 4,
      date: '2023-12-07',
      title: 'Beautiful View',
      content: 'The perfect spot right on the Beach facing the ocean watching the dolphins go by,quiet area on the beach.Condo was stocked with whatever you need and the owner very responsive if u need anything.Booked for next year already.',
      verified: true,
      stayed: 'October 2023',
      expanded: false
    },
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
      id: 5,
      name: 'Sheron M.',
      rating: 4,
      date: '2023-06-05',
      title: 'Winter 2 month getaway',
      content: 'We had a very nice 2 month stay at this really well equipped 2 bdrm condo which had been renovated with a new kitchen, living room and everything you could need. Being located on the 2nd floor was perfect for coming and going without using elevators. Jay the owner was extremely helpful. Was very quick answering any questions and came right over when the battery in the electric door opener died. The beach was steps away. Easy walk to restaurants and short drive to shopping. I would recommend this unit to anyone.',
      verified: true,
      stayed: 'January 2023',
      expanded: false
    }
  ]);



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
    { icon: Square, label: '990 sq ft' },
    { icon: Building2, label: 'Community Pool' },
    { icon: Waves, label: 'Gulf Front View' }
  ];

  const amenities = [
    { icon: Waves, label: 'Beach Access' },
    { icon: Building2, label: 'Community Center' },
    { icon: Coffee, label: 'Fully Equipped Kitchen' },
    { icon: Car, label: 'Dedicated Parking' },
    { icon: Calendar, label: 'Flexible Check-in' },
    { icon: Settings, label: 'Fullsize Washer/Dryer' }
  ];

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  const faqData = [
    {
      id: 1,
      question: "Is the condo fully stocked with amenities like high speed wifi, cable, one 45\" HDTV in living room, beach towels, beach chairs, paper towels, toilet paper, etc.",
      answer: "Yes"
    },
    {
      id: 2,
      question: "How do I access the property to check in.",
      answer: "You will be provided with a door code on your day of arrival one hour before check in."
    },
    {
      id: 3,
      question: "What about parking?",
      answer: "There is a dedicated parking spot for 1 car. Additional cars may park in visitor spots if available. There is also a public parking, boat dock across the street for a small daily fee."
    }
  ];

  const navigationItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'location', label: 'Location' },
    { id: 'faq', label: 'FAQ' }
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
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
            Your browser does not support the video tag.
          </video>
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

      {/* Navigation Bar */}
      <section className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center space-x-1 py-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                About this property
              </h2>
              <h3 className="text-2xl font-semibold text-blue-600 mb-6">
                Indian Shores Condo
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">Sleeps 4</div>
                  <div className="text-sm text-gray-600">Guests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">2</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">2</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">1000</div>
                  <div className="text-sm text-gray-600">sq. ft.</div>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-lg text-gray-600">{averageRating.toFixed(1)} from {reviews.length} reviews</span>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                This totally updated beachfront unit features sweeping views of the gulf and a spacious open floor plan. Highlights of this furnished condo include modern granite kitchen counter tops, new bathrooms, new wood flooring, windows and hurricane shutters. Stunning views of powder soft sand and the beckoning waters of the Gulf of Mexico are visible from the living room, separate dining area, balcony and large master bedroom with the bonus of being able to see the intracoastal from the East.
              </p>
              
              <p className="text-lg text-gray-700 mb-6">
                This is an attractive price for your piece of direct beachfront in Indian Shores, Florida. Life can't get better than boating & skiing behind this premium waterfront condo! Wake up everyday to the calming sounds of the Gulf as the waves hit the shoreline giving the feel of being on an endless Tropical vacation. Community features include an updated community center area, a sizable in-ground swimming pool and dedicated parking.
              </p>
              
              <p className="text-lg text-gray-700 mb-6">
                Convenient location just steps to the beach, with easy access to dining, shopping, sports and more. A perfect environment for all-year-round entertainment. Come live the true Florida lifestyle!! Are you ready for Fun in the Sun at Gulf Shores Condo in Indian Shores?
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-semibold">Non smoking only!</p>
              </div>

              <h4 className="text-xl font-semibold text-gray-900 mb-4">Unique Benefits</h4>
              <p className="text-lg text-gray-700 mb-6">
                Perched on the 2nd floor in the heart of Gulfshores, our beachfront 2BR/2BA condo sits just 10 feet above the sugar-white sands of Indian Shores. Enjoy breathtaking ocean views, direct beach access, and relax in the Gulfshores pool after a day in the sun!
              </p>

              <h4 className="text-xl font-semibold text-gray-900 mb-4">Why Kids Love It</h4>
              <p className="text-lg text-gray-700 mb-6">
                Because it is the beach!!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Beach Paradise
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
      <section id="amenities" className="py-20">
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
      <section id="reviews" className="py-20">
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
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
              <div key={review.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
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
          
          {reviews.length > 3 && (
            <div className="text-center">
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                {showAllReviews ? (
                  <>
                    Show Less Reviews
                    <ChevronUp className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Show All Reviews
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Area Information
            </h2>
            
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                Indian Shores, Florida, is a captivating seaside oasis nestled along the Gulf of Mexico's glittering coastline. Renowned for its pristine beaches, Indian Shores offers an idyllic retreat for those seeking tranquility, natural beauty, and a touch of coastal elegance. The community exudes a laid-back, welcoming atmosphere, making it a perfect destination for families, couples, and solo adventurers alike.
              </p>
              
              <p className="text-lg text-gray-700 mb-6">
                Spanning just a few miles, this charming locale is dotted with luxurious beachfront condos, cozy vacation rentals, and inviting local eateries, all harmonizing to create a serene paradise. Indian Shores is distinguished by its soft, white sandy beaches that stretch endlessly, framed by the gentle waves of the Gulf, offering a picturesque setting for sunbathing, leisurely strolls, and unforgettable sunsets.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">Attractions Within Walking Distance</h3>
              <p className="text-lg text-gray-700 mb-6">
                Indian Shores coffee.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Favorite Places To Eat</h3>
              <p className="text-lg text-gray-700 mb-6">
                Salt Rock Grill, Bored Grill, Burrito Social, VIP Mexican Cuisine, Kooky Coconut and Slyce Pizza
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqData.map((faq) => (
              <div key={faq.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-700">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="mr-3">
                <svg className="h-8 w-8" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Palm Run logo">
                  <path d="M34 28 C33 40 32 50 32 60 L28 60 C28 50 29 40 30 28 Z" fill="#8B5A2B"/>
                  <path d="M29 34 H33 M28.8 38 H32.6 M28.6 42 H32.4 M28.4 46 H32.2 M28.2 50 H32" stroke="#A87444" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="31" cy="28" r="2.2" fill="#6B4423"/>
                  <circle cx="35" cy="27" r="2" fill="#6B4423"/>
                  <path d="M32 20 C22 12, 13 15, 8 20 C16 20, 24 22, 32 24 Z" fill="#1E9E57"/>
                  <path d="M32 20 C26 10, 20 10, 14 12 C20 14, 26 18, 32 22 Z" fill="#26B36A"/>
                  <path d="M32 20 C42 12, 51 15, 56 20 C48 20, 40 22, 32 24 Z" fill="#1E9E57"/>
                  <path d="M32 20 C38 10, 44 10, 50 12 C44 14, 38 18, 32 22 Z" fill="#26B36A"/>
                  <path d="M32 20 C30 12, 32 8, 36 6 C34 10, 34 16, 32 20 Z" fill="#1E9E57"/>
                </svg>
              </div>
              <span className="text-2xl font-bold"><span className="text-blue-400">Palm</span> Run</span>
            </div>
            <p className="text-gray-300 mb-6">
              Beachfront Condo Rental • Indian Shores, FL
            </p>
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => setShowFAQ(!showFAQ)}
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                FAQ
              </button>
              <Link to="/contact" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                Contact
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                © 2024 Palm Run. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;

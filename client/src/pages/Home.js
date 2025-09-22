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
      id: 5,
      name: 'Sheron M.',
      rating: 3,
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
      <section className="py-20">
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
      <section className="py-20">
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
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                {showAllReviews ? (
                  <>
                    Show Less Reviews
                    <ChevronUp className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    View All {reviews.length} Reviews
                    <ChevronDown className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>


    </div>
  );
};

export default Home;

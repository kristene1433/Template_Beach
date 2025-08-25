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
  ChevronUp
} from 'lucide-react';

const Home = () => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Terry and Linda T.',
      rating: 5,
      date: '2023-04-11',
      title: 'Beautiful Condo with Sun, Sand and Surf',
      content: 'We stayed for the entire month of March. Second floor, mid-building, convenient to elevator, pool, community room, and quick beach access. 2 good-sized bedrooms and baths with plenty of storage. We could turn off AC, open a large window facing the beach, and fall asleep to the sound of the surf. Hall closet with cleaning supplies/equipment. Kitchen updated with hardwood floors, granite countertops, stone backsplash, and stainless appliances. Plenty of storage and supplies. Living room with comfortable leather furniture and surround sound TV. Covered balcony for enjoying views, sunsets, and occasional dolphin sightings. Lots of beach chairs, wagon, and coolers available. This is a quiet beach, unlike the noise and swarms of people like Clearwater. Tons of activities all along the coast and around Tampa within an hour or two. Get info from Chambers of Commerce. Restaurants are fantastic! Well-placed between Dunedin and St. Petersburg very near the bridge to Tampa. If you\'re looking for a little piece of paradise that is reasonably priced, this Gulf Shores condo is perfect for you.',
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
      content: 'Everything was perfect! Location, Owners, Access to the beach and pool. From the moment you walk in you can sense the love the owners have put into their property. The kitchen is fully stocked, their washer/dryer combo is state of the art, the beds are great and as wine drinkers we truly appreciated nice wine glasses. The condo was impeccably clean. We definitely can\'t wait to return next year. Thank Jay and Kristine for sharing your lovely condo with others to enjoy.',
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
      content: 'I had a wonderful stay at this beautiful condo and the hosts were fantastic! The condo had everything you can possibly need without bringing it from home! It\'s located on the 2nd floor which is convenient to both the elevator and the stairs. The entrance to access the beach is right below the unit along with the pool. With the gulf front view, every day is magical. I call it my slice of paradise - truly heaven on earth!! ENJOY!',
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

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to
              <span className="block text-yellow-300">Palm Run LLC</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Experience luxury beachfront living in our stunning Gulf Shores condo. 
              Your perfect beach getaway awaits in Indian Shores, Florida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 inline-flex items-center justify-center"
              >
                Apply Now
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-700 font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 inline-flex items-center justify-center"
              >
                Tenant Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Property Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Gulf Shores Beachfront Condo
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Beachfront unit with sweeping views of the gulf. Our condo features stunning views of powder soft sand and the beckoning waters of the Gulf of Mexico visible from the living room, separate dining area, balcony, and large master bedroom.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Perched on the 2nd floor in the heart of Gulfshores, our beachfront 2BR/2BA condo sits just 10 feet above the sugar-white sands of Indian Shores. Features include granite kitchen countertops, bathrooms, wood flooring, windows and hurricane shutters. Wake up to the calming sounds of the Gulf as the waves hit the shoreline giving the feel of being on an endless Tropical vacation.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {propertyFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {feature.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="ml-1 text-lg font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                  <span className="ml-1 text-gray-600">({reviews.length} reviews)</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Community Amenities</h4>
                <p className="text-sm text-blue-800">
                  Community center area, sizable in-ground swimming pool, dedicated parking, and convenient location just steps to the beach with easy access to dining, shopping, sports and more.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-w-16 aspect-h-12 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/image1.jpg"
                  alt="Gulf Shores Beachfront Condo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
                  }}
                />
              </div>
              <div className="absolute top-4 right-4">
                <button className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200">
                  <Heart className="w-6 h-6 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-gray-50">
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Read reviews from our satisfied guests and share your own experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="card">
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
                <p className="text-gray-600 mb-4 italic text-sm">
                  {review.expanded 
                    ? `"${review.content}"`
                    : `"${review.content.length > 150 ? review.content.substring(0, 150) + '...' : review.content}"`
                  }
                </p>
                
                {review.content.length > 150 && (
                  <button
                    onClick={() => toggleReviewExpansion(review.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 flex items-center"
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
                    <div className="text-sm text-gray-500">Submitted: {review.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

          {showReviewForm && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Share Your Experience
                </h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={newReview.name}
                      onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Review Title"
                      value={newReview.title}
                      onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="When did you stay? (e.g., March 2024)"
                      value={newReview.stayed}
                      onChange={(e) => setNewReview({...newReview, stayed: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setNewReview({...newReview, rating})}
                          className={`p-2 rounded ${
                            newReview.rating >= rating 
                              ? 'text-yellow-500' 
                              : 'text-gray-300'
                          }`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <textarea
                      placeholder="Share your experience with this property..."
                      rows="4"
                      value={newReview.content}
                      onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                      className="input-field resize-none"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Have questions about our Gulf Shores condo or ready to apply? 
                Our team is here to help you secure your perfect beachfront home.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">(407) 687-1270</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">palmrunbeachcondo@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">18650 Gulf Blvd Unit 207, Indian Shores, FL 33785</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Perfect Location</h4>
                <p className="text-sm text-blue-800">
                  Well-placed between Dunedin and St. Petersburg, very near the bridge to Tampa. A perfect environment for all-year-round entertainment with tons of activities all along the coast and around Tampa within an hour or two.
                </p>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Send us a Message
              </h3>
              <p className="text-gray-600 mb-6">
                Have questions about our Gulf Shores condo or ready to apply? 
                Send us a message and we'll get back to you promptly.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Us</p>
                    <p className="text-sm text-gray-600">palmrunbeachcondo@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Call Us</p>
                    <p className="text-sm text-gray-600">(407) 687-1270</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Visit Us</p>
                    <p className="text-sm text-gray-600">18650 Gulf Blvd Unit 207, Indian Shores, FL 33785</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  to="/contact"
                  className="btn-primary w-full text-center block"
                >
                  Send Detailed Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

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
  const [activeSection, setActiveSection] = useState('overview');
  const [showOverviewDetails, setShowOverviewDetails] = useState(false);
  const [rates, setRates] = useState([]);
  const [showAllRates, setShowAllRates] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  // Gallery items with captions
  const galleryItems = [
    { src: '/images/condoFront.jpeg', caption: 'Front of Building' },
    { src: '/images/condoBack.jpeg', caption: 'Back of Building' },
    { src: '/images/livingroom.jpg', caption: 'Living Room' },
    { src: '/images/kitchen.jpg', caption: 'Kitchen' },
    { src: '/images/bedroom1.jpg', caption: 'Primary Bedroom' },
    { src: '/images/bedroom2.jpg', caption: 'Second Bedroom' },
    { src: '/images/bathroom1.jpg', caption: 'Primary Bathroom' },
    { src: '/images/bathroom2.jpg', caption: 'Second Bathroom' },
    { src: '/images/patio.jpg', caption: 'Patio / Balcony' }
  ];

  // FAQ removed

  const navigationItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'rates', label: 'Rates' },
    { id: 'availability', label: 'Availability' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'location', label: 'Location' }
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Load rates from API
  const loadRates = async () => {
    try {
      const response = await fetch('/api/rates');
      if (response.ok) {
        const data = await response.json();
        setRates(data.rates || []);
      }
    } catch (error) {
      console.error('Error loading rates:', error);
    }
  };

  // Load availability from API
  const loadAvailability = React.useCallback(async () => {
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 4, 0);
      
      const response = await fetch(`/api/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability || []);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  }, [currentMonth]);

  // Load rates and availability on component mount
  React.useEffect(() => {
    loadRates();
    loadAvailability();
  }, [loadAvailability]);

  // Load availability when currentMonth changes
  React.useEffect(() => {
    loadAvailability();
  }, [currentMonth, loadAvailability]);

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateAvailable = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const availabilityRecord = availability.find(record => 
      record.date.split('T')[0] === dateStr
    );
    return availabilityRecord ? availabilityRecord.isAvailable : true;
  };

  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const generateCalendarMonths = () => {
    const months = [];
    // Show only 3 months starting from the currentMonth selection
    for (let i = 0; i < 3; i++) {
      const month = new Date(currentMonth);
      month.setMonth(currentMonth.getMonth() + i);
      months.push(month);
    }
    return months;
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
      <section className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center md:justify-center gap-2 py-2 md:py-6 overflow-x-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-3 py-2 text-sm md:px-6 md:py-3 md:text-base font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white shadow md:shadow-md'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 md:hover:shadow-sm'
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
                  <div className="text-2xl font-bold text-gray-900">990</div>
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
                This is an attractive price for your piece of direct beachfront in Indian Shores, Florida. Life can't get better than boating & skiing behind this premium waterfront condo! Wake up everyday to the calming sounds of the Gulf as the waves hit the shoreline giving the feel of being on an endless Tropical vacation. Community features include an updated community center area, a sizable in-ground swimming pool and dedicated parking. Convenient location just steps to the beach, with easy access to dining, shopping, sports and more. A perfect environment for all-year-round entertainment. Come live the true Florida lifestyle!! Are you ready for Fun in the Sun at Gulf Shores Condo in Indian Shores?
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-semibold">Non smoking only!</p>
              </div>

              <h4 className="text-xl font-semibold text-gray-900 mb-4">Unique Benefits</h4>
              <p className="text-lg text-gray-700 mb-6">
                Perched on the 2nd floor in the heart of Gulfshores, our beachfront 2BR/2BA condo sits just 10 feet above the sugar-white sands of Indian Shores. Enjoy breathtaking ocean views, direct beach access, and relax in the Gulfshores pool after a day in the sun!
              </p>

              

              {/* Show More/Show Less Toggle */}
              <div className="text-center mb-6">
                <button
                  onClick={() => setShowOverviewDetails(!showOverviewDetails)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {showOverviewDetails ? (
                    <>
                      Show Less
                      <ChevronUp className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Show More
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>

              {/* Additional Details - Collapsible */}
              {showOverviewDetails && (
                <div className="border-t border-gray-200 pt-6">

                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Inside Scoop</h4>
                  <p className="text-lg text-gray-700 mb-6">
                    For those in the know, Indian Shores, Florida, offers much more than its picturesque beaches and tranquil Gulf waters. This hidden gem is brimming with local secrets and insider tips that elevate any visit from ordinary to unforgettable. Here's your exclusive scoop to experiencing Indian Shores like a true insider:
                  </p>

                  <h5 className="text-lg font-semibold text-gray-900 mb-3">Discover the Hidden Parks</h5>
                  <p className="text-lg text-gray-700 mb-6">
                    Beyond the well-trodden sandy shores, Indian Shores boasts several small, lesser-known parks and nature preserves. Tucked away from the main road, these tranquil spots, such as Town Square Nature Park, offer serene settings for picnics, bird watching, or simply escaping into nature. With shaded pathways and wooden walkways winding through native flora, these hidden parks are perfect for those seeking a quiet retreat.
                  </p>

                  <h5 className="text-lg font-semibold text-gray-900 mb-3">Early Morning Dolphin Watching</h5>
                  <p className="text-lg text-gray-700 mb-6">
                    The Gulf Coast is famous for its marine life, and Indian Shores is no exception. For a truly magical experience, head to the beach or the Intracoastal Waterway at sunrise. This is when the dolphins are most active, playing and hunting in the cooler waters. Few sights are as breathtaking as watching these graceful creatures against the backdrop of a Florida sunrise, and the early morning light provides the perfect conditions for photography enthusiasts.
                  </p>

                  <h5 className="text-lg font-semibold text-gray-900 mb-3">Local Dining Gems</h5>
                  <p className="text-lg text-gray-700 mb-6">
                    Indian Shores may be small, but it's mighty in flavor. Skip the tourist hotspots and dine where the locals go. For instance, the Indian Shores Coffee Company is not just a coffee shop but a local gathering place known for its eclectic decor, live music, and vibrant atmosphere. For seafood enthusiasts, the Salt Rock Grill offers an unbeatable combination of fresh catches and waterfront dining, a favorite for those in the know.
                  </p>

                  <h5 className="text-lg font-semibold text-gray-900 mb-3">Paddleboarding and Kayaking in Secluded Waters</h5>
                  <p className="text-lg text-gray-700 mb-6">
                    While the beaches may draw the crowds, the real beauty lies in the quiet waters of the Intracoastal Waterway. Renting a paddleboard or kayak can lead you to secluded waterways, where mangrove tunnels and calm waters offer a peaceful exploration of Florida's natural landscapes. These areas are often teeming with wildlife, including manatees, sea turtles, and various bird species, providing a unique opportunity to connect with nature away from the crowds.
                  </p>

                  <h5 className="text-lg font-semibold text-gray-900 mb-3">Support Local Art and Culture</h5>
                  <p className="text-lg text-gray-700 mb-6">
                    Indian Shores is home to a vibrant community of artists and craftsmen, and supporting local art is a great way to take a piece of your trip home with you. Small galleries and shops dot the area, showcasing everything from handcrafted jewelry to paintings inspired by the Gulf Coast's beauty. The Beach Art Center offers workshops and classes for those interested in tapping into their creative side, providing a unique way to engage with the local culture.
                  </p>

                  <p className="text-lg text-gray-700 mb-6">
                    By embracing these insider tips, you'll discover the heart and soul of Indian Shores, experiencing the area through the eyes of those who call it home. Whether it's through its hidden natural treasures, local flavors, or cultural offerings, Indian Shores is a place where every visit can be as unique and memorable as the town itself.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section (below Overview) */}
      <section id="gallery" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Gallery</h2>
              <p className="text-gray-600 mt-2">A look inside and around the condo.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {galleryItems.map((item, idx) => (
                <figure key={idx} className="overflow-hidden rounded-lg shadow-sm bg-white">
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="w-full h-40 md:h-48 object-cover transform hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <figcaption className="px-3 py-2 text-sm text-gray-700 border-t">
                    {item.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Rates Section */}
      <section id="rates" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Rates
              </h2>
              <p className="text-lg text-gray-600">
                Rental basis: Per property
              </p>
              <div className="flex justify-end mt-4">
                <span className="text-sm text-gray-600">Rental rates quoted in </span>
                <select className="ml-2 text-sm border border-gray-300 rounded px-2 py-1">
                  <option value="USD">$ USD</option>
                </select>
              </div>
            </div>

            {rates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Min Stay
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(showAllRates ? rates : rates.slice(0, 5)).map((rate, index) => (
                      <tr key={rate.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rate.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rate.monthly ? `$${rate.monthly.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rate.minStay ? `${rate.minStay} nights` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No rates available at this time.</p>
              </div>
            )}

            {rates.length > 5 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllRates(!showAllRates)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {showAllRates ? (
                    <>
                      View Less Periods
                      <ChevronUp className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      View More Periods
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Availability Section */}
      <section id="availability" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Availability
              </h2>
              <p className="text-lg text-gray-600">
                Last updated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => navigateMonth(-1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Previous
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next &gt;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {generateCalendarMonths().map((month, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: getFirstDayOfMonth(month) }, (_, i) => (
                      <div key={`empty-${i}`} className="h-8"></div>
                    ))}
                    
                    {Array.from({ length: getDaysInMonth(month) }, (_, i) => {
                      const day = i + 1;
                      const date = new Date(month.getFullYear(), month.getMonth(), day);
                      const isAvailable = isDateAvailable(date);
                      const isPast = isDateInPast(date);
                      
                      return (
                        <div
                          key={day}
                          className={`h-8 flex items-center justify-center text-sm font-medium rounded ${
                            isPast
                              ? 'text-gray-300 bg-gray-100'
                              : isAvailable
                                ? 'text-gray-900 bg-green-100 hover:bg-green-200 cursor-pointer'
                                : 'text-gray-500 bg-red-100 line-through'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Unavailable</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Past dates</span>
              </div>
            </div>
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
              Location
            </h2>
            
            {/* Google Map */}
            <div className="mb-8">
              <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3817.4159028563463!2d-82.84213442433193!3d27.840261919616356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2f94974b36fcb%3A0x80193fd4662f0040!2s18650%20Gulf%20Blvd%2C%20Indian%20Shores%2C%20FL%2033785!5e1!3m2!1sen!2sus!4v1758637167222!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Indian Shores Location Map"
                ></iframe>
              </div>
              
              {/* Map Info Overlay */}
              <div className="mt-4 bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Coordinates:</strong> 27°50′24.8″N 82°50'22.3″W
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Plus Code:</strong> R5R6+35P Indian Shores, Florida
                    </p>
                    <div className="flex space-x-4">
                      <a
                        href="https://www.google.com/maps/dir/?api=1&destination=Indian+Shores,+FL"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Directions
                      </a>
                      <a
                        href="https://www.google.com/maps/place/Indian+Shores,+FL/@27.8402222,-82.8397222,15z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View larger map
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nearest Points of Interest */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Nearest</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Nearest Airport</h4>
                  <p className="text-gray-600">Tampa International - 24 miles</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Nearest Bar</h4>
                  <p className="text-gray-600">Mahuffers, Broke N Bored, Coconut Charlies - 0.5 miles</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Nearest Beach</h4>
                  <p className="text-gray-600">Indian Shores - 10 feet</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Nearest Golf</h4>
                  <p className="text-gray-600">Largo Golf Course - 5 miles</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Nearest Theme Park</h4>
                  <p className="text-gray-600">Busch Gardens - 36 miles</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Nearest Restaurant</h4>
                  <p className="text-gray-600">Salt Rock Grill - 1 mile</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ removed per request */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="mr-2">
                <svg className="h-6 w-6" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Palm Run logo">
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
              <span className="text-xl font-bold"><span className="text-blue-400">Palm</span> Run</span>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Beachfront Condo Rental • Indian Shores, FL
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/contact" className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm">
                Contact
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400">
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

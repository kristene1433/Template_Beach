import React, { useState, useEffect, useCallback } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import {
  Plus,
  Save,
  X,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAvailability = () => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [bulkAction, setBulkAction] = useState('available');
  const [bulkReason, setBulkReason] = useState('');
  const [showBulkForm, setShowBulkForm] = useState(false);

  // Fetch availability
  const fetchAvailability = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 4, 0);
      
      const response = await fetch(`/api/availability/admin/all?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      setAvailability(data.availability || []);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

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

  // Handle date selection
  const handleDateClick = (date) => {
    if (isDateInPast(date)) return;
    
    // Format date as YYYY-MM-DD for API compatibility
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  // Handle individual date toggle (double-click)
  const handleDateDoubleClick = async (date) => {
    if (isDateInPast(date)) return;
    
    const dateStr = date.toISOString().split('T')[0];
    const isCurrentlyAvailable = isDateAvailable(date);
    const newAvailability = !isCurrentlyAvailable;
    
    console.log('Updating date:', dateStr, 'to:', newAvailability);
    
    try {
      const response = await fetch(`/api/availability/admin/${dateStr}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isAvailable: newAvailability,
          reason: newAvailability ? 'Available' : 'Unavailable'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to update availability');
      }

      toast.success(`Date ${dateStr} updated to ${newAvailability ? 'available' : 'unavailable'}`);
      fetchAvailability();
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.message);
    }
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (selectedDates.length === 0) {
      toast.error('Please select dates to update');
      return;
    }

    console.log('Bulk updating dates:', selectedDates, 'to:', bulkAction);

    try {
      const response = await fetch('/api/availability/admin/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          dates: selectedDates,
          isAvailable: bulkAction === 'available',
          reason: bulkReason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Bulk API Error:', errorData);
        throw new Error(errorData.error || 'Failed to update availability');
      }

      toast.success(`Updated ${selectedDates.length} dates to ${bulkAction}`);
      setSelectedDates([]);
      setBulkReason('');
      setShowBulkForm(false);
      fetchAvailability();
    } catch (err) {
      console.error('Bulk update error:', err);
      toast.error(err.message);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading availability...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAvailability}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Availability Management</h1>
              <p className="text-gray-600">Manage property availability calendar</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <strong>Quick Tip:</strong> Double-click any date to toggle availability
              </div>
              <button
                onClick={() => setShowBulkForm(!showBulkForm)}
                disabled={selectedDates.length === 0}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Bulk Update ({selectedDates.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bulk Update Form */}
        {showBulkForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Bulk Update ({selectedDates.length} dates selected)
              </h2>
              <button
                onClick={() => setShowBulkForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set to:
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="available"
                      checked={bulkAction === 'available'}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="unavailable"
                      checked={bulkAction === 'unavailable'}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Unavailable</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Maintenance, Booked, etc."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowBulkForm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpdate}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update {selectedDates.length} Dates
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Navigation */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Calendar Grid */}
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
                    const isSelected = selectedDates.includes(date.toISOString().split('T')[0]);
                    
                    return (
                      <div
                        key={day}
                        className={`h-8 flex items-center justify-center text-sm font-medium rounded cursor-pointer transition-colors duration-200 ${
                          isPast
                            ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                            : isSelected
                              ? 'text-white bg-blue-600'
                              : isAvailable
                                ? 'text-gray-900 bg-green-100 hover:bg-green-200'
                                : 'text-gray-500 bg-red-100 hover:bg-red-200'
                        }`}
                        onClick={() => handleDateClick(date)}
                        onDoubleClick={() => handleDateDoubleClick(date)}
                        title={isPast ? 'Past date' : `${isAvailable ? 'Available' : 'Unavailable'} - Click to select, Double-click to toggle`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
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
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Selected</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Single-click</strong> on dates to select them for bulk updates</li>
              <li>• <strong>Double-click</strong> on any date to instantly toggle its availability</li>
              <li>• Use the "Bulk Update" button to change multiple selected dates at once</li>
              <li>• Green dates are available, red dates are unavailable</li>
              <li>• Past dates cannot be modified</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAvailability;

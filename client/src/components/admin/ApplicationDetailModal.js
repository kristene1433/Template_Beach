import React from 'react';
import { XCircle, UserCheck, Mail, Phone, MapPin, Calendar, Users, FileText, DollarSign, Download, ArrowRightLeft, Trash2 } from 'lucide-react';
import { getStatusIcon, getStatusBadge, formatDate } from '../../utils/adminHelpers';

const ApplicationDetailModal = ({
  selectedApplication,
  setSelectedApplication,
  isEditingApplication,
  setIsEditingApplication,
  editApplicationData,
  setEditApplicationData,
  savingApplication,
  setSavingApplication,
  handleEditApplication,
  handleCancelEditApplication,
  handleApplicationInputChange,
  handleSaveApplicationEdit,
  updateApplicationStatus,
  reviewDocuments,
  generateLease,
  handleTransferAmount,
  deleteApplication
}) => {
  if (!selectedApplication) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8">
      <div className="relative w-full max-w-6xl h-[90vh] bg-white border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.25)] rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Application Details</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Submitted {formatDate(selectedApplication.submittedAt || selectedApplication.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedApplication(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
              title="Close"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="px-6 py-6 space-y-6">
            {/* Personal Information */}
            <div className="space-y-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Personal Information
                </h4>
                {!isEditingApplication ? (
                  <button
                    onClick={handleEditApplication}
                    className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveApplicationEdit}
                      disabled={savingApplication}
                      className="flex items-center px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {savingApplication ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEditApplication}
                      disabled={savingApplication}
                      className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                  <div className="flex-1">
                    {isEditingApplication ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={editApplicationData.firstName || ''}
                          onChange={(e) => handleApplicationInputChange('firstName', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          value={editApplicationData.lastName || ''}
                          onChange={(e) => handleApplicationInputChange('lastName', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Last Name"
                        />
                      </div>
                    ) : (
                      <span className="text-sm">
                        <strong>Name:</strong> {selectedApplication.firstName} {selectedApplication.lastName}
                        {selectedApplication.applicationNumber && (
                          <span className="ml-2 text-blue-600 font-semibold">
                            ({selectedApplication.applicationNumber})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                  <div className="flex-1">
                    {isEditingApplication ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={editApplicationData.secondApplicantFirstName || ''}
                          onChange={(e) => handleApplicationInputChange('secondApplicantFirstName', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Co-Applicant First Name"
                        />
                        <input
                          type="text"
                          value={editApplicationData.secondApplicantLastName || ''}
                          onChange={(e) => handleApplicationInputChange('secondApplicantLastName', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Co-Applicant Last Name"
                        />
                      </div>
                    ) : (
                      <span className="text-sm">
                        <strong>Co-Applicant:</strong> {selectedApplication.secondApplicantFirstName && selectedApplication.secondApplicantLastName 
                          ? `${selectedApplication.secondApplicantFirstName} ${selectedApplication.secondApplicantLastName}`
                          : 'None'
                        }
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm">
                    <strong>Email:</strong> {selectedApplication.userId?.email || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <div className="flex-1">
                    {isEditingApplication ? (
                      <input
                        type="tel"
                        value={editApplicationData.phone || ''}
                        onChange={(e) => handleApplicationInputChange('phone', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Phone Number"
                      />
                    ) : (
                      <span className="text-sm">
                        <strong>Phone:</strong> {selectedApplication.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div className="flex-1">
                    {isEditingApplication ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editApplicationData.address?.street || ''}
                          onChange={(e) => handleApplicationInputChange('address.street', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Street Address"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={editApplicationData.address?.city || ''}
                            onChange={(e) => handleApplicationInputChange('address.city', e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="City"
                          />
                          <input
                            type="text"
                            value={editApplicationData.address?.state || ''}
                            onChange={(e) => handleApplicationInputChange('address.state', e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="State"
                          />
                          <input
                            type="text"
                            value={editApplicationData.address?.zipCode || ''}
                            onChange={(e) => handleApplicationInputChange('address.zipCode', e.target.value)}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="ZIP"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm">
                        <strong>Address:</strong><br />
                        {selectedApplication.fullAddress}
                      </span>
                    )}
                  </div>
                </div>
                {selectedApplication.rentalAmount && (
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm">
                      <strong>Monthly Rent:</strong> ${selectedApplication.rentalAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div className="flex-1">
                    {isEditingApplication ? (
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          value={editApplicationData.requestedStartDate || ''}
                          onChange={(e) => handleApplicationInputChange('requestedStartDate', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-500 self-center">to</span>
                        <input
                          type="date"
                          value={editApplicationData.requestedEndDate || ''}
                          onChange={(e) => handleApplicationInputChange('requestedEndDate', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <span className="text-sm">
                        <strong>Requested Dates:</strong> {selectedApplication.requestedStartDate && selectedApplication.requestedEndDate 
                          ? `${new Date(selectedApplication.requestedStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(selectedApplication.requestedEndDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                          : 'Not specified'
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Guests */}
              <div className="flex items-start">
                <Users className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div className="flex-1">
                  {isEditingApplication ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Additional Guests:</label>
                      {(editApplicationData.additionalGuests || []).map((guest, index) => (
                        <div key={index} className="flex space-x-2 items-center">
                          <input
                            type="text"
                            value={guest.firstName || ''}
                            onChange={(e) => {
                              const newGuests = [...editApplicationData.additionalGuests];
                              newGuests[index] = { ...newGuests[index], firstName: e.target.value };
                              handleApplicationInputChange('additionalGuests', newGuests);
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="First Name"
                          />
                          <input
                            type="text"
                            value={guest.lastName || ''}
                            onChange={(e) => {
                              const newGuests = [...editApplicationData.additionalGuests];
                              newGuests[index] = { ...newGuests[index], lastName: e.target.value };
                              handleApplicationInputChange('additionalGuests', newGuests);
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Last Name"
                          />
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={guest.isAdult || false}
                              onChange={(e) => {
                                const newGuests = [...editApplicationData.additionalGuests];
                                newGuests[index] = { ...newGuests[index], isAdult: e.target.checked };
                                handleApplicationInputChange('additionalGuests', newGuests);
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-1 text-xs text-gray-600">Adult</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newGuests = editApplicationData.additionalGuests.filter((_, i) => i !== index);
                              handleApplicationInputChange('additionalGuests', newGuests);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newGuests = [...(editApplicationData.additionalGuests || []), { firstName: '', lastName: '', isAdult: true }];
                          handleApplicationInputChange('additionalGuests', newGuests);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Guest
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm">
                      <strong>Additional Guests ({(selectedApplication.additionalGuests || []).length}):</strong> 
                      {(selectedApplication.additionalGuests || []).length > 0 ? (
                        selectedApplication.additionalGuests.map((guest, index) => (
                          <span key={index}>
                            {guest.firstName} {guest.lastName}
                            {guest.isAdult ? ' (Adult)' : ' (Child)'}
                            {index < selectedApplication.additionalGuests.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      ) : (
                        ' None'
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div className="flex-1">
                  {isEditingApplication ? (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Admin Notes:</label>
                      <textarea
                        value={editApplicationData.notes || ''}
                        onChange={(e) => handleApplicationInputChange('notes', e.target.value)}
                        className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add admin notes..."
                        rows={3}
                      />
                    </div>
                  ) : (
                    <span className="text-sm">
                      <strong>Admin Notes:</strong> {selectedApplication.notes || 'None'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Application Status */}
            <div className="space-y-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Application Status
              </h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm">
                    <strong>Submitted:</strong> {formatDate(selectedApplication.submittedAt || selectedApplication.createdAt)}
                  </span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(selectedApplication.status)}
                  <span className="text-sm ml-2">
                    <strong>Status:</strong> 
                    <span className={`ml-2 ${getStatusBadge(selectedApplication.status)}`}>
                      {selectedApplication.status}
                    </span>
                  </span>
                </div>
                {selectedApplication.signedLeaseFile && (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">
                      <strong>Lease Uploaded:</strong> 
                      <span className="text-green-600 ml-2">{formatDate(selectedApplication.signedLeaseFile.uploadedAt)}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status:
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id, 'approved')}
                    className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id, 'rejected')}
                    className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id, 'completed')}
                    className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap justify-end gap-3">
              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <button
                  onClick={() => reviewDocuments(selectedApplication)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Review Documents ({selectedApplication.documents.length})
                </button>
              )}
              {selectedApplication.status === 'approved' && (
                <button
                  onClick={() => generateLease(selectedApplication)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Lease Agreement
                </button>
              )}
              <button
                onClick={() => handleTransferAmount(selectedApplication)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Transfer Amount
              </button>
              <button
                onClick={() => deleteApplication(selectedApplication._id)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Application
              </button>
              <button
                onClick={() => setSelectedApplication(null)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;

import React from 'react';

const SessionTimeoutModal = ({ secondsRemaining, onStay, onLogout }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900">Session expiring soon</h2>
        <p className="mt-3 text-sm text-gray-600">
          You&apos;ve been inactive for a while. For security, you&apos;ll be signed out in{' '}
          <span className="font-semibold text-gray-900">{secondsRemaining}</span> seconds unless you stay signed in.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Sign out now
          </button>
          <button
            type="button"
            onClick={onStay}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;

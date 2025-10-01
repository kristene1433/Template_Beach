import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
    default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

export const getStatusBadge = (status) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  switch (status) {
    case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'approved': return `${baseClasses} bg-green-100 text-green-800`;
    case 'rejected': return `${baseClasses} bg-red-100 text-red-800`;
    case 'completed': return `${baseClasses} bg-blue-100 text-blue-800`;
    default: return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

export const formatDate = (value) => {
  if (!value) return 'Not set';

  // If it's already a Date instance
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return 'Invalid Date';
    return value.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // If it's a number (timestamp) or string (ISO) – let Date handle it
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'Invalid Date';

  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const createManualPaymentDefaults = () => ({
  amount: '',
  paymentType: 'rent',
  paymentDate: new Date().toISOString().split('T')[0],
  checkNumber: '',
  notes: ''
});

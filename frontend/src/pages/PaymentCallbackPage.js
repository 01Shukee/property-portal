import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const PaymentCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get transaction_id from URL params (Flutterwave returns this)
      const transactionId = searchParams.get('transaction_id');
      const status = searchParams.get('status');

      if (!transactionId) {
        setError('No transaction ID found');
        setVerifying(false);
        return;
      }

      if (status === 'cancelled') {
        setError('Payment was cancelled');
        setVerifying(false);
        return;
      }

      // Verify payment with backend
      const result = await paymentAPI.verify(transactionId);
      
      if (result.success) {
        setSuccess(true);
        setPayment(result.payment);
      } else {
        setError(result.message || 'Payment verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Payment...
          </h2>
          <p className="text-gray-600">Please wait while we confirm your transaction</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ❌
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
            Payment Failed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/payments')}
            className="w-full btn btn-primary"
          >
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

  if (success && payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✅
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your payment has been confirmed
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-gray-900">₦{payment.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Property:</span>
                <span className="font-medium text-gray-900">{payment.property?.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt:</span>
                <span className="font-medium text-gray-900">{payment.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date(payment.paidAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/payments')}
            className="w-full btn btn-primary"
          >
            View Payment History
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentCallbackPage;
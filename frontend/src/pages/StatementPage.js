import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statementAPI } from '../services/api';
import Navigation from '../components/Navigation';

const StatementPage = () => {
  const { type, id } = useParams(); // type = 'tenant' or 'property'
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadStatement();
  }, [id, selectedYear]);

  const loadStatement = async () => {
    try {
      let data;
      if (type === 'tenant') {
        data = await statementAPI.getTenantStatement(id, selectedYear);
      } else {
        data = await statementAPI.getPropertyStatement(id, selectedYear);
      }
      setStatement(data.statement);
    } catch (error) {
      console.error('Error loading statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getMonthStatus = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generating statement...</p>
        </div>
      </div>
    );
  }

  if (!statement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Statement Not Found
            </h3>
            <p className="text-gray-600">Unable to generate statement</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 print:py-0">
        {/* Controls (hidden when printing) */}
        <div className="mb-8 flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back
          </button>
          <div className="flex gap-4 items-center">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input max-w-[150px]"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            <button onClick={handlePrint} className="btn btn-primary">
              🖨️ Print Statement
            </button>
          </div>
        </div>

        {/* Statement Document */}
        <div className="bg-white shadow-lg rounded-xl p-8 print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="text-center mb-8 pb-8 border-b-2 border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              STATEMENT OF ACCOUNT
            </h1>
            <p className="text-xl text-gray-600">
              For the year ending December 31, {selectedYear}
            </p>
          </div>

          {/* TENANT STATEMENT */}
          {type === 'tenant' && (
            <>
              {/* Tenant Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Tenant Information</h3>
                  <p className="text-gray-700"><strong>Name:</strong> {statement.tenant.name}</p>
                  <p className="text-gray-700"><strong>Email:</strong> {statement.tenant.email}</p>
                  <p className="text-gray-700"><strong>Phone:</strong> {statement.tenant.phone}</p>
                  {statement.tenant.address && (
                    <p className="text-gray-700"><strong>Address:</strong> {statement.tenant.address}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Property Details</h3>
                  <p className="text-gray-700"><strong>Property:</strong> {statement.property.address}</p>
                  <p className="text-gray-700"><strong>Location:</strong> {statement.property.city}, {statement.property.state}</p>
                  <p className="text-gray-700"><strong>Unit:</strong> {statement.unit.unitNumber} ({statement.unit.unitType})</p>
                  <p className="text-gray-700"><strong>Monthly Rent:</strong> ₦{statement.lease.monthlyRent.toLocaleString()}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Summary</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Expected</p>
                    <p className="text-2xl font-bold text-gray-900">₦{statement.summary.totalExpected.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">₦{statement.summary.totalPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Balance</p>
                    <p className={`text-2xl font-bold ${statement.summary.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₦{Math.abs(statement.summary.balance).toLocaleString()}
                      {statement.summary.balance < 0 && ' (Overpaid)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      statement.summary.status === 'fully_paid' ? 'bg-green-100 text-green-800' :
                      statement.summary.status === 'overpaid' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {statement.summary.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Breakdown */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Monthly Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4">Month</th>
                        <th className="text-right py-3 px-4">Expected</th>
                        <th className="text-right py-3 px-4">Paid</th>
                        <th className="text-right py-3 px-4">Balance</th>
                        <th className="text-center py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.monthlyBreakdown.map((month) => (
                        <tr key={month.month} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{month.monthName}</td>
                          <td className="text-right py-3 px-4">₦{month.expected.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-green-600">₦{month.paid.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-red-600">₦{month.balance.toLocaleString()}</td>
                          <td className="text-center py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getMonthStatus(month.status)}`}>
                              {month.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300 font-bold">
                        <td className="py-3 px-4">TOTAL</td>
                        <td className="text-right py-3 px-4">₦{statement.summary.totalExpected.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-green-600">₦{statement.summary.totalPaid.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-red-600">₦{statement.summary.balance.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment History */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Payment History</h3>
                <div className="space-y-3">
                  {statement.payments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{new Date(payment.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Receipt: {payment.receiptNumber}</p>
                        <p className="text-xs text-gray-500 capitalize">{payment.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">₦{payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 capitalize">{payment.paymentType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* PROPERTY STATEMENT */}
          {type === 'property' && (
            <>
              {/* Property Info */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Property Information</h3>
                <p className="text-gray-700"><strong>Property:</strong> {statement.property.address}</p>
                <p className="text-gray-700"><strong>Location:</strong> {statement.property.city}, {statement.property.state}</p>
                {statement.owner && (
                  <p className="text-gray-700"><strong>Owner:</strong> {statement.owner.name}</p>
                )}
              </div>

              {/* Summary */}
              <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Overall Summary</h3>
                <div className="grid md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Units</p>
                    <p className="text-2xl font-bold text-gray-900">{statement.summary.totalUnits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Occupied</p>
                    <p className="text-2xl font-bold text-blue-600">{statement.summary.occupiedUnits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Expected</p>
                    <p className="text-2xl font-bold text-gray-900">₦{statement.summary.totalExpected.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Collected</p>
                    <p className="text-2xl font-bold text-green-600">₦{statement.summary.totalPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Collection Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{statement.summary.collectionRate}</p>
                  </div>
                </div>
              </div>

              {/* Unit Breakdown */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Unit Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4">Unit</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Tenant</th>
                        <th className="text-right py-3 px-4">Monthly Rent</th>
                        <th className="text-right py-3 px-4">Expected</th>
                        <th className="text-right py-3 px-4">Paid</th>
                        <th className="text-right py-3 px-4">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.units.map((unit) => (
                        <tr key={unit.unitNumber} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{unit.unitNumber}</td>
                          <td className="py-3 px-4 capitalize">{unit.unitType}</td>
                          <td className="py-3 px-4">{unit.tenant ? unit.tenant.name : <span className="text-gray-400">Vacant</span>}</td>
                          <td className="text-right py-3 px-4">₦{unit.monthlyRent.toLocaleString()}</td>
                          <td className="text-right py-3 px-4">₦{unit.totalExpected.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-green-600">₦{unit.totalPaid.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-red-600">₦{unit.balance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300 font-bold">
                        <td className="py-3 px-4" colSpan="4">TOTAL</td>
                        <td className="text-right py-3 px-4">₦{statement.summary.totalExpected.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-green-600">₦{statement.summary.totalPaid.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-red-600">₦{statement.summary.totalBalance.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="pt-8 border-t-2 border-gray-200">
            <p className="text-sm text-gray-600">
              Generated on: {new Date(statement.generatedAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Generated by: {statement.generatedBy}
            </p>
            <p className="text-xs text-gray-500 mt-4">
              This is a system-generated statement. For any discrepancies, please contact PropertyHub support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatementPage;
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Lease = require('../models/Lease');
const Unit = require('../models/Unit');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/statements/tenant/:tenantId
 * @desc    Generate statement of account for a tenant (year-end)
 * @access  Private (Property Manager, Homeowner, Tenant)
 */
router.get('/tenant/:tenantId', protect, async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { year } = req.query; // e.g., ?year=2025
    
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Get tenant's lease
    const lease = await Lease.findOne({
      tenant: tenantId,
      status: 'active'
    })
      .populate('tenant', 'name email phone address')
      .populate('property', 'address city state')
      .populate('unit', 'unitNumber unitType rentAmount');

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: 'No active lease found for this tenant'
      });
    }

    // Check access
    const property = await Property.findById(lease.property._id);
    const hasAccess = 
      property.propertyManager?.toString() === req.user._id.toString() ||
      property.homeowner?.toString() === req.user._id.toString() ||
      lease.tenant._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Get all payments for this year
    const startDate = new Date(targetYear, 0, 1); // Jan 1
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59); // Dec 31

    const payments = await Payment.find({
      tenant: tenantId,
      unit: lease.unit._id,
      status: 'successful',
      paidAt: { $gte: startDate, $lte: endDate }
    }).sort('paidAt');

    // Calculate totals
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const monthlyRent = lease.monthlyRent;
    const monthsInYear = 12;
    const totalExpected = monthlyRent * monthsInYear;
    const balance = totalExpected - totalPaid;

    // Monthly breakdown
    const monthlyBreakdown = [];
    for (let month = 0; month < 12; month++) {
      const monthPayments = payments.filter(p => {
        const paidDate = new Date(p.paidAt);
        return paidDate.getMonth() === month;
      });

      const monthTotal = monthPayments.reduce((sum, p) => sum + p.amount, 0);

      monthlyBreakdown.push({
        month: month + 1,
        monthName: new Date(targetYear, month, 1).toLocaleString('default', { month: 'long' }),
        expected: monthlyRent,
        paid: monthTotal,
        balance: monthlyRent - monthTotal,
        status: monthTotal >= monthlyRent ? 'paid' : monthTotal > 0 ? 'partial' : 'unpaid',
        payments: monthPayments
      });
    }

    const statement = {
      tenant: {
        name: lease.tenant.name,
        email: lease.tenant.email,
        phone: lease.tenant.phone,
        address: lease.tenant.address
      },
      property: {
        address: lease.property.address,
        city: lease.property.city,
        state: lease.property.state
      },
      unit: {
        unitNumber: lease.unit.unitNumber,
        unitType: lease.unit.unitType,
        rentAmount: lease.unit.rentAmount
      },
      lease: {
        startDate: lease.startDate,
        endDate: lease.endDate,
        monthlyRent: lease.monthlyRent,
        status: lease.status
      },
      period: {
        year: targetYear,
        startDate,
        endDate
      },
      summary: {
        totalExpected,
        totalPaid,
        balance,
        paymentsMade: payments.length,
        status: balance === 0 ? 'fully_paid' : balance < 0 ? 'overpaid' : 'outstanding'
      },
      monthlyBreakdown,
      payments: payments.map(p => ({
        date: p.paidAt,
        amount: p.amount,
        receiptNumber: p.receiptNumber,
        paymentType: p.paymentType,
        paymentMethod: p.paymentMethod
      })),
      generatedAt: new Date(),
      generatedBy: req.user.name
    };

    res.status(200).json({
      success: true,
      statement
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/statements/property/:propertyId
 * @desc    Generate statement for entire property (all units)
 * @access  Private (Property Manager, Homeowner)
 */
router.get('/property/:propertyId', protect, authorize('property_manager', 'homeowner'), async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { year } = req.query;
    
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Verify access
    const property = await Property.findById(propertyId)
      .populate('homeowner', 'name email')
      .populate('propertyManager', 'name email');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const hasAccess = 
      property.propertyManager?._id.toString() === req.user._id.toString() ||
      property.homeowner?._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Get all units
    const units = await Unit.find({ property: propertyId })
      .populate('currentTenant', 'name email')
      .populate('currentLease');

    // Get all payments for this year
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const allPayments = await Payment.find({
      property: propertyId,
      status: 'successful',
      paidAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate per-unit breakdown
    const unitStatements = await Promise.all(
      units.map(async (unit) => {
        const unitPayments = allPayments.filter(
          p => p.unit?.toString() === unit._id.toString()
        );

        const totalPaid = unitPayments.reduce((sum, p) => sum + p.amount, 0);
        const monthlyRent = unit.rentAmount / 12;
        const totalExpected = monthlyRent * 12;

        return {
          unitNumber: unit.unitNumber,
          unitType: unit.unitType,
          status: unit.status,
          tenant: unit.currentTenant ? {
            name: unit.currentTenant.name,
            email: unit.currentTenant.email
          } : null,
          monthlyRent,
          totalExpected,
          totalPaid,
          balance: totalExpected - totalPaid,
          paymentCount: unitPayments.length
        };
      })
    );

    // Overall property totals
    const totalExpected = unitStatements.reduce((sum, u) => sum + u.totalExpected, 0);
    const totalPaid = unitStatements.reduce((sum, u) => sum + u.totalPaid, 0);
    const totalBalance = totalExpected - totalPaid;

    const statement = {
      property: {
        address: property.address,
        city: property.city,
        state: property.state
      },
      owner: property.homeowner ? {
        name: property.homeowner.name,
        email: property.homeowner.email
      } : null,
      period: {
        year: targetYear,
        startDate,
        endDate
      },
      summary: {
        totalUnits: units.length,
        occupiedUnits: units.filter(u => u.status === 'occupied').length,
        vacantUnits: units.filter(u => u.status === 'vacant').length,
        totalExpected,
        totalPaid,
        totalBalance,
        collectionRate: totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(2) + '%' : '0%'
      },
      units: unitStatements,
      generatedAt: new Date(),
      generatedBy: req.user.name
    };

    res.status(200).json({
      success: true,
      statement
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
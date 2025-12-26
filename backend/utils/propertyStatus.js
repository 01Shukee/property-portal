const Unit = require('../models/Unit');
const Property = require('../models/Property');

/**
 * Update property status based on its units
 */
async function updatePropertyStatus(propertyId) {
  try {
    const units = await Unit.find({ property: propertyId });
    
    if (units.length === 0) {
      // No units, keep current status
      return;
    }
    
    const hasVacant = units.some(unit => unit.status === 'vacant');
    const allOccupied = units.every(unit => unit.status === 'occupied' || unit.status === 'reserved');
    
    const property = await Property.findById(propertyId);
    
    if (!property) return;
    
    if (allOccupied) {
      property.status = 'occupied';
    } else if (hasVacant) {
      property.status = 'vacant';
    } else {
      // Has some maintenance or other status
      property.status = 'maintenance';
    }
    
    await property.save();
    console.log(`✅ Property ${property.address} status updated to: ${property.status}`);
  } catch (error) {
    console.error('Error updating property status:', error);
  }
}

module.exports = { updatePropertyStatus };
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Announcement = require('../models/Announcement');

/**
 * Cleanup old resolved maintenance requests (7+ days old)
 */
const cleanupOldMaintenance = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const result = await MaintenanceRequest.deleteMany({
      status: 'resolved',
      resolvedAt: { $lt: sevenDaysAgo }
    });
    
    console.log(`✅ Cleaned up ${result.deletedCount} old resolved maintenance requests`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up maintenance:', error);
    return 0;
  }
};

/**
 * Cleanup old announcements (7+ days old)
 */
const cleanupOldAnnouncements = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const result = await Announcement.deleteMany({
      createdAt: { $lt: sevenDaysAgo }
    });
    
    console.log(`✅ Cleaned up ${result.deletedCount} old announcements`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up announcements:', error);
    return 0;
  }
};

/**
 * Cleanup expired tenant invitations and unreserve units
 */
const cleanupExpiredInvitations = async () => {
  try {
    const User = require('../models/User');
    const Unit = require('../models/Unit');
    const { updatePropertyStatus } = require('./propertyStatus');

    // Find all expired invitations
    const expiredTenants = await User.find({
      role: 'tenant',
      invitationToken: { $exists: true },
      invitationExpires: { $lt: Date.now() }
    });

    let cleanedCount = 0;

    for (const tenant of expiredTenants) {
      if (tenant.pendingInvitation && tenant.pendingInvitation.unit) {
        // Unreserve the unit
        const unit = await Unit.findById(tenant.pendingInvitation.unit);
        if (unit && unit.status === 'reserved') {
          unit.status = 'vacant';
          await unit.save();

          // Update property status
          await updatePropertyStatus(unit.property);

          console.log(`✅ Unit ${unit.unitNumber} unreserved (invitation expired)`);
          cleanedCount++;
        }
      }

      // Clear invitation data
      tenant.invitationToken = undefined;
      tenant.invitationExpires = undefined;
      tenant.pendingInvitation = undefined;
      await tenant.save();
    }

    console.log(`✅ Cleaned up ${cleanedCount} expired invitations`);
    return cleanedCount;
  } catch (error) {
    console.error('❌ Error cleaning up invitations:', error);
    return 0;
  }
};

/**
 * Run all cleanup jobs
 */
const runCleanupJobs = async () => {
  console.log('🧹 Running cleanup jobs...');
  await cleanupOldMaintenance();
  await cleanupOldAnnouncements();
  await cleanupExpiredInvitations(); // NEW!
  console.log('✅ Cleanup complete!');
};

// Run cleanup every 24 hours (86400000 ms)
const startCleanupSchedule = () => {
  // Run immediately on startup
  runCleanupJobs();
  
  // Then run every 24 hours
  setInterval(runCleanupJobs, 24 * 60 * 60 * 1000);
  
  console.log('✅ Cleanup scheduler started');
};

module.exports = {
  cleanupOldMaintenance,
  cleanupOldAnnouncements,
  cleanupExpiredInvitations,
  runCleanupJobs,
  startCleanupSchedule
};
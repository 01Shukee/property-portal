const nodemailer = require('nodemailer');

// DEBUG: Log nodemailer object
console.log('🔍 Nodemailer loaded:', nodemailer);
console.log('🔍 Type of nodemailer:', typeof nodemailer);
console.log('🔍 Has createTransport?', typeof nodemailer.createTransport);

/**
 * Email Service for PropertyHub
 * Handles all email notifications
 */

// Create transporter
const createTransporter = () => {
  console.log('🔍 Inside createTransporter, nodemailer is:', nodemailer);
  
  // For development: Use Gmail or Ethereal (fake SMTP)
  // For production: Use SendGrid, Mailgun, or AWS SES
  
  if (process.env.NODE_ENV === 'production') {
    // Production email service (e.g., SendGrid)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development: Gmail SMTP (you can use your own Gmail)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use App Password, not regular password
      }
    });
  }
};

/**
 * Send email helper
 */
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"PropertyHub" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Homeowner Invitation Email
 */
const sendHomeownerInvitation = async (homeowner, invitationLink, propertyAddress) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .property { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Welcome to PropertyHub!</h1>
        </div>
        <div class="content">
          <p>Hi ${homeowner.name},</p>
          
          <p>You've been invited to manage your property on PropertyHub - Nigeria's leading property management platform.</p>
          
          <div class="property">
            <strong>Your Property:</strong><br>
            📍 ${propertyAddress}
          </div>
          
          <p>Click the button below to accept your invitation and set your password:</p>
          
          <a href="${invitationLink}" class="button">Accept Invitation</a>
          
          <p style="font-size: 12px; color: #6b7280;">
            Or copy this link: ${invitationLink}
          </p>
          
          <p><strong>What you can do:</strong></p>
          <ul>
            <li>✅ View your property details and tenants</li>
            <li>✅ Track maintenance requests</li>
            <li>✅ Monitor payment history</li>
            <li>✅ Make announcements to tenants</li>
          </ul>
          
          <p>This invitation expires in 7 days.</p>
          
          <p>Best regards,<br>The PropertyHub Team</p>
        </div>
        <div class="footer">
          <p>© 2025 PropertyHub. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(homeowner.email, 'You\'re Invited to PropertyHub! 🏠', html);
};

/**
 * Tenant Invitation Email (PM invites tenant to specific unit)
 */
const sendTenantInvitationEmail = async (tenant, unit, property, invitationLink) => {
  const monthlyRent = unit.rentAmount / 12;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; font-size: 16px; }
        .unit-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
        .highlight { background: #ede9fe; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        .rent-amount { font-size: 28px; color: #667eea; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 You're Invited!</h1>
          <p style="margin: 0; font-size: 16px;">Your new home awaits</p>
        </div>
        <div class="content">
          <p>Hi ${tenant.name},</p>
          
          <p>Great news! You've been invited to rent a unit at one of our premium properties.</p>
          
          <div class="unit-box">
            <h3 style="margin-top: 0; color: #667eea;">📍 Your Unit Details</h3>
            <strong>Property:</strong> ${property.address}<br>
            <strong>Location:</strong> ${property.city}, ${property.state}<br>
            <strong>Unit:</strong> ${unit.unitNumber} (${unit.unitType})<br>
            ${unit.bedrooms ? `<strong>Layout:</strong> ${unit.bedrooms} Bedroom${unit.bedrooms > 1 ? 's' : ''}, ${unit.bathrooms} Bathroom${unit.bathrooms > 1 ? 's' : ''}<br>` : ''}
            ${unit.squareFeet ? `<strong>Size:</strong> ${unit.squareFeet} sq ft<br>` : ''}
          </div>
          
          <div class="highlight">
            <p style="margin: 0; text-align: center;">
              <strong>Monthly Rent</strong><br>
              <span class="rent-amount">₦${monthlyRent.toLocaleString()}</span>
            </p>
            <p style="margin: 10px 0 0 0; text-align: center; font-size: 14px; color: #6b7280;">
              Annual: ₦${unit.rentAmount.toLocaleString()}
            </p>
          </div>
          
          ${tenant.pendingInvitation ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Move-in Date:</strong> ${new Date(tenant.pendingInvitation.moveInDate).toLocaleDateString()}<br>
              <strong>Lease Duration:</strong> ${tenant.pendingInvitation.leaseDuration} months
            </div>
          ` : ''}
          
          <p style="text-align: center;">
            <strong>Ready to move in?</strong><br>
            Click the button below to accept your invitation and complete your setup:
          </p>
          
          <div style="text-align: center;">
            <a href="${invitationLink}" class="button">✅ Accept Invitation</a>
          </div>
          
          <p style="font-size: 12px; color: #6b7280; word-break: break-all;">
            Or copy this link: ${invitationLink}
          </p>
          
          <div style="background: #e0e7ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>What happens next?</strong></p>
            <ul style="margin: 10px 0;">
              <li>✅ Accept the invitation and set your password</li>
              <li>✅ Your lease will be created automatically</li>
              <li>✅ Access your tenant portal immediately</li>
              <li>✅ Make payments and manage your rental online</li>
            </ul>
          </div>
          
          <p><strong>⚠️ Important:</strong> This invitation expires in 7 days. Please accept it before ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}.</p>
          
          <p>If you have any questions, please contact your property manager.</p>
          
          <p>We look forward to welcoming you home!</p>
          
          <p>Best regards,<br>
          <strong>PropertyHub Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 PropertyHub. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(tenant.email, `🏠 You're Invited! Your New Home at ${property.address}`, html);
};

/**
 * Application Submitted Notification (to Property Manager)
 */
const sendApplicationSubmittedNotification = async (propertyManager, tenant, property) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 New Application Received!</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          
          <p>You have a new tenant application to review:</p>
          
          <div class="info-box">
            <strong>Applicant:</strong> ${tenant.name}<br>
            <strong>Property:</strong> ${property.address}, ${property.city}<br>
            <strong>Email:</strong> ${tenant.email}<br>
            <strong>Phone:</strong> ${tenant.phone}
          </div>
          
          <p>Log in to PropertyHub to review and approve this application.</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/applications" class="button">Review Application</a>
          
          <p>Best regards,<br>PropertyHub</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(propertyManager.email, 'New Tenant Application 📝', html);
};

/**
 * Application Approved Notification (to Tenant)
 */
const sendApplicationApprovedNotification = async (tenant, property, lease) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d1fae5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Application Approved!</h1>
        </div>
        <div class="content">
          <p>Congratulations ${tenant.name}!</p>
          
          <div class="success-box">
            <strong>✅ Your application has been approved!</strong><br><br>
            <strong>Property:</strong> ${property.address}, ${property.city}<br>
            <strong>Monthly Rent:</strong> ₦${lease.monthlyRent?.toLocaleString()}<br>
            <strong>Move-in Date:</strong> ${new Date(lease.startDate).toLocaleDateString()}<br>
            <strong>Lease Duration:</strong> ${lease.leaseDuration} months
          </div>
          
          <p>Your lease is now active. Log in to PropertyHub to:</p>
          <ul>
            <li>View your lease details</li>
            <li>Make rent payments</li>
            <li>Submit maintenance requests</li>
            <li>Connect with other tenants</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/leases" class="button">View My Lease</a>
          
          <p>Welcome to your new home!</p>
          
          <p>Best regards,<br>PropertyHub Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(tenant.email, 'Application Approved - Welcome Home! 🎉', html);
};

/**
 * Maintenance Request Notification (to Property Manager)
 */
const sendMaintenanceRequestNotification = async (propertyManager, request, property, tenant) => {
  const priorityEmoji = {
    urgent: '🚨',
    high: '⚠️',
    medium: '🔶',
    low: '🔵'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fee2e2; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 New Maintenance Request</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          
          <div class="alert-box">
            <strong>${priorityEmoji[request.priority]} ${request.priority.toUpperCase()} PRIORITY</strong><br><br>
            <strong>Issue:</strong> ${request.title}<br>
            <strong>Category:</strong> ${request.category}<br>
            <strong>Property:</strong> ${property.address}, ${property.city}<br>
            <strong>Reported by:</strong> ${tenant.name}<br>
            <strong>Contact:</strong> ${tenant.phone}
          </div>
          
          <p><strong>Description:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 5px;">${request.description}</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/maintenance" class="button">View Request</a>
          
          <p>Please address this issue promptly.</p>
          
          <p>Best regards,<br>PropertyHub</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(propertyManager.email, `🔧 ${request.priority.toUpperCase()}: ${request.title}`, html);
};

/**
 * Maintenance Resolved Notification (to Tenant)
 */
const sendMaintenanceResolvedNotification = async (tenant, request, property) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d1fae5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Issue Resolved!</h1>
        </div>
        <div class="content">
          <p>Hi ${tenant.name},</p>
          
          <p>Good news! Your maintenance request has been resolved.</p>
          
          <div class="success-box">
            <strong>Issue:</strong> ${request.title}<br>
            <strong>Property:</strong> ${property.address}
          </div>
          
          ${request.resolutionNotes ? `
            <p><strong>Resolution Notes:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 5px;">${request.resolutionNotes}</p>
          ` : ''}
          
          <p>If you have any concerns, please don't hesitate to reach out.</p>
          
          <p>Best regards,<br>PropertyHub</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(tenant.email, '✅ Maintenance Issue Resolved', html);
};

/**
 * Payment Successful Notification (to Tenant)
 */
const sendPaymentSuccessNotification = async (tenant, payment, property) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .receipt { background: white; padding: 20px; border: 2px solid #10b981; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💳 Payment Received!</h1>
        </div>
        <div class="content">
          <p>Hi ${tenant.name},</p>
          
          <p>Thank you! Your payment has been processed successfully.</p>
          
          <div class="receipt">
            <h3 style="margin-top: 0;">Payment Receipt</h3>
            <strong>Receipt Number:</strong> ${payment.receiptNumber}<br>
            <strong>Amount:</strong> ₦${payment.amount?.toLocaleString()}<br>
            <strong>Property:</strong> ${property.address}<br>
            <strong>Payment Type:</strong> ${payment.paymentType}<br>
            <strong>Date:</strong> ${new Date(payment.paidAt).toLocaleDateString()}<br>
            <strong>Status:</strong> ✅ Successful
          </div>
          
          <p style="font-size: 12px; color: #6b7280;">
            Keep this receipt for your records. You can also view it anytime in your PropertyHub dashboard.
          </p>
          
          <p>Best regards,<br>PropertyHub</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(tenant.email, `Receipt: ${payment.receiptNumber} - Payment Successful 💳`, html);
};

module.exports = {
  sendEmail,
  sendHomeownerInvitation,
  sendTenantInvitationEmail,
  sendApplicationSubmittedNotification,
  sendApplicationApprovedNotification,
  sendMaintenanceRequestNotification,
  sendMaintenanceResolvedNotification,
  sendPaymentSuccessNotification
};
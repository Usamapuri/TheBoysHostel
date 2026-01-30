"use server"

/**
 * Email Notification System
 * 
 * Basic implementation with console logging
 * TODO: Integrate with SendGrid, Resend, or other email service
 */

export async function sendRegistrationApprovedEmail(
  email: string,
  hostelName: string,
  subdomain: string,
  adminName: string
): Promise<void> {
  console.log(`
📧 EMAIL NOTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${email}
Subject: Your Hostel Registration has been Approved! 🎉

Dear ${adminName},

Congratulations! Your hostel "${hostelName}" has been approved.

Your hostel management portal is now ready at:
🔗 https://${subdomain}.yourdomain.com

You can login with:
📧 Email: ${email}
🔑 Password: (the password you set during registration)

Get started by:
1. Adding your hostel locations/buildings
2. Creating rooms and beds
3. Adding students
4. Setting up financial tracking

If you need any help, our support team is here for you.

Best regards,
HostelFlow Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
  // TODO: Replace with actual email sending
}

export async function sendRegistrationRejectedEmail(
  email: string,
  hostelName: string,
  adminName: string,
  reason: string
): Promise<void> {
  console.log(`
📧 EMAIL NOTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${email}
Subject: Update on Your Hostel Registration

Dear ${adminName},

Thank you for your interest in HostelFlow for "${hostelName}".

After review, we are unable to approve your registration at this time.

Reason: ${reason}

If you have questions or would like to reapply, please contact our support team.

Best regards,
HostelFlow Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
  // TODO: Replace with actual email sending
}

export async function sendNewRegistrationNotification(
  superAdminEmail: string,
  hostelName: string,
  subdomain: string,
  adminName: string,
  adminEmail: string
): Promise<void> {
  console.log(`
📧 EMAIL NOTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${superAdminEmail}
Subject: 🔔 New Hostel Registration Request

New Registration Request:

🏢 Hostel Name: ${hostelName}
🌐 Subdomain: ${subdomain}
👤 Admin Name: ${adminName}
📧 Admin Email: ${adminEmail}

Please review and approve/reject this request in the super admin dashboard:
🔗 https://yourdomain.com/superadmin/requests

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
  // TODO: Replace with actual email sending
}

export async function sendTenantSuspensionEmail(
  email: string,
  hostelName: string,
  adminName: string,
  reason: string
): Promise<void> {
  console.log(`
📧 EMAIL NOTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${email}
Subject: Important: Account Suspension Notice

Dear ${adminName},

Your hostel "${hostelName}" has been temporarily suspended.

Reason: ${reason}

Your account access has been restricted. Please contact support for more information.

Best regards,
HostelFlow Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
  // TODO: Replace with actual email sending
}

export async function sendTenantActivationEmail(
  email: string,
  hostelName: string,
  adminName: string
): Promise<void> {
  console.log(`
📧 EMAIL NOTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${email}
Subject: Your Account Has Been Reactivated ✅

Dear ${adminName},

Good news! Your hostel "${hostelName}" has been reactivated.

You can now access your dashboard and continue managing your hostel.

Best regards,
HostelFlow Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
  // TODO: Replace with actual email sending
}

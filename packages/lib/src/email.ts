import { Resend } from 'resend';
import { siteConfig } from '../../config/src/site';

// Initialize Resend with API key from environment variables
// Use a dummy key during build time to avoid errors
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

/**
 * Send OTP verification email to users during onboarding
 * @param to - Recipient email address
 * @param otp - 6-digit OTP code
 * @param userType - Type of user (teacher, guardian, freelancer, or client)
 * @param userName - Name of the user
 * @returns Promise with send result
 */
export async function sendOTPEmail(
  to: string,
  otp: string,
  userType: 'teacher' | 'guardian' | 'freelancer' | 'client',
  userName?: string
) {
  try {
    // Validate Resend API key
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Validate email from address
    const from = process.env.EMAIL_FROM || 'onboarding@academyoftutorials.com';

    const userTypeLabel = 
      userType === 'teacher' ? 'Teacher' : 
      userType === 'guardian' ? 'Guardian' :
      userType === 'freelancer' ? 'Freelancer' :
      'Client';
    const greeting = userName ? `Hi ${userName}` : `Hi there`;

    const { data, error } = await resend.emails.send({
      from,
      to,
      // Keep subject concise; body and preheader will include a copy-friendly code phrase
      subject: `Your Academy of Tutorials Verification Code`,
      html: generateOTPEmailHTML(otp, userTypeLabel, greeting),
      text: generateOTPEmailText(otp, userTypeLabel),
    });

    if (error) {
      console.error('[Email Error]', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('[sendOTPEmail] Error:', error);
    throw error;
  }
}

/**
 * Send Password Reset OTP email to users
 * @param to - Recipient email address
 * @param otp - 6-digit OTP code
 * @param userName - Optional user name for greeting
 */
export async function sendPasswordResetEmail(
  to: string,
  otp: string,
  userName?: string
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const from = process.env.EMAIL_FROM || 'security@academyoftutorials.com';
    const greeting = userName ? `Hi ${userName}` : `Hi there`;

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `Your Academy of Tutorials Password Reset Code`,
      html: generateResetOTPEmailHTML(otp, greeting),
      text: generateResetOTPEmailText(otp),
    });

    if (error) {
      console.error('[Email Error]', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('[sendPasswordResetEmail] Error:', error);
    throw error;
  }
}

/**
 * Generate HTML template for OTP email
 */
function generateOTPEmailHTML(
  otp: string,
  userType: string,
  greeting: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting" content="yes">
  <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Preheader: helps iOS/Android Mail/Gmail detect code and show Copy Code in notifications -->
    <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
      ${otp} is your Academy of Tutorials verification code.
    </div>
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
        Academy of Tutorials
      </h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
        ${userType} Onboarding
      </p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
        ${greeting}! 👋
      </h2>
      
      <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
        Welcome to <strong>Academy of Tutorials</strong>! To complete your ${userType.toLowerCase()} registration, please verify your email address using the code below:
      </p>
      
      <!-- OTP Code Box -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
        <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">
          Your Verification Code
        </p>
        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; display: inline-block;">
          <p style="color: #667eea; font-size: 36px; font-weight: 700; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${otp}
          </p>
        </div>
      </div>
      <p style="color: #333333; line-height: 1.6; margin: 10px 0 0 0; font-size: 16px;">
        ${otp} is your Academy of Tutorials verification code.
      </p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #666666; margin: 0; font-size: 14px; line-height: 1.5;">
          ⏰ <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>. Please enter it in the verification screen to continue.
        </p>
      </div>
      
      <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
        If you didn't request this code, please ignore this email or contact our support team if you have concerns.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="color: #999999; margin: 0 0 10px 0; font-size: 12px;">
        This is an automated message from Academy of Tutorials
      </p>
      <p style="color: #999999; margin: 0; font-size: 12px;">
        © ${new Date().getFullYear()} Academy of Tutorials. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text template for OTP email
 */
function generateOTPEmailText(otp: string, userType: string): string {
  return `
Academy of Tutorials - ${userType} Onboarding

${otp} is your Academy of Tutorials verification code.

Your Verification Code: ${otp}

Welcome to Academy of Tutorials! To complete your ${userType.toLowerCase()} registration, please verify your email address using the code above.

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email or contact our support team.

© ${new Date().getFullYear()} Academy of Tutorials. All rights reserved.
  `.trim();
}

// Password reset templates
function generateResetOTPEmailHTML(otp: string, greeting: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting" content="yes">
  <title>Password Reset</title>
  <style>
    body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color:#f5f5f5; }
  </style>
  </head>
  <body>
    <div style="max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#ef4444 0%, #f59e0b 100%);padding:36px 20px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Password Reset</h1>
      </div>
      <div style="padding:32px 28px;">
        <h2 style="margin:0 0 12px 0;color:#111827;font-size:20px;font-weight:600;">${greeting} 👋</h2>
        <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.6;">
          You requested to reset your password for your Academy of Tutorials account. Use the code below to proceed:
        </p>
        <div style="background:linear-gradient(135deg,#ef4444 0%, #f59e0b 100%);border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
          <p style="color:#fff;margin:0 0 10px 0;font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:0.9;">Your Reset Code</p>
          <div style="display:inline-block;background:#fff;border-radius:10px;padding:16px 24px;">
            <p style="margin:0;color:#ef4444;font-size:32px;font-weight:800;letter-spacing:8px;font-family:'Courier New',monospace;">${otp}</p>
          </div>
        </div>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 12px 0;">⏰ This code expires in <strong>10 minutes</strong>.</p>
        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">If you didn't request this, you can safely ignore this email.</p>
      </div>
      <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;margin:0;font-size:12px;">© ${new Date().getFullYear()} Academy of Tutorials</p>
      </div>
    </div>
  </body>
  </html>
  `.trim();
}

function generateResetOTPEmailText(otp: string): string {
  return `
Academy of Tutorials - Password Reset

Use this code to reset your password: ${otp}

This code will expire in 10 minutes.
If you didn't request this, you can ignore this email.

© ${new Date().getFullYear()} Academy of Tutorials.
  `.trim();
}

/**
 * Send welcome email after successful verification (optional - for future use)
 */
export async function sendWelcomeEmail(
  to: string,
  userType: 'teacher' | 'guardian',
  userName: string
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const from = process.env.EMAIL_FROM || 'onboarding@academyoftutorials.com';
    const userTypeLabel = userType === 'teacher' ? 'Teacher' : 'Guardian';

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `Welcome to Academy of Tutorials, ${userName}!`,
      html: generateWelcomeEmailHTML(userName, userTypeLabel),
      text: generateWelcomeEmailText(userName, userTypeLabel),
    });

    if (error) {
      console.error('[Email Error]', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('[sendWelcomeEmail] Error:', error);
    throw error;
  }
}

function generateWelcomeEmailHTML(userName: string, userType: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Academy of Tutorials</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
        Welcome to Academy of Tutorials! 🎉
      </h1>
    </div>
    
    <div style="padding: 40px 30px;">
      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
        Hi ${userName}! 👋
      </h2>
      
      <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
        Congratulations! Your email has been verified successfully, and your ${userType.toLowerCase()} account is now active.
      </p>
      
      <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
        You can now complete your profile and start ${userType === 'Teacher' ? 'connecting with guardians' : 'finding the perfect teacher for your child'}.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || siteConfig.url || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Go to Dashboard
        </a>
      </div>

      <!-- Feedback CTA -->
      <div style="background-color:#f8f9fa; border-left:4px solid #22c55e; padding:16px 20px; border-radius:6px; margin: 24px 0;">
        <p style="color:#374151; margin:0 0 12px 0; font-size:15px; line-height:1.6;">
          We’d love your feedback — tell us how we can improve your experience.
        </p>
        <div style="text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || siteConfig.url || 'http://localhost:3000'}/feedback" style="display:inline-block; background:#22c55e; color:#fff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600; font-size:14px;">Share Feedback</a>
        </div>
      </div>

      <!-- Share CTA -->
      <div style="background-color:#f8f9fa; border-left:4px solid #3b82f6; padding:16px 20px; border-radius:6px;">
        <p style="color:#374151; margin:0 0 12px 0; font-size:15px; line-height:1.6;">
          Know someone who might need Academy of Tutorials? Share it with them:
        </p>
        <div style="text-align:center;">
          <a href="https://wa.me/?text=${encodeURIComponent('Find qualified tutors at ' + (process.env.NEXT_PUBLIC_APP_URL || siteConfig.url || 'http://localhost:3000'))}" style="display:inline-block; background:#25D366; color:#fff; text-decoration:none; padding:10px 16px; border-radius:8px; font-weight:600; font-size:14px; margin-right:8px;">Share on WhatsApp</a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || siteConfig.url || 'http://localhost:3000'}" style="display:inline-block; background:#111827; color:#fff; text-decoration:none; padding:10px 16px; border-radius:8px; font-weight:600; font-size:14px;">Copy Link</a>
        </div>
      </div>
    </div>
    
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="color: #999999; margin: 0; font-size: 12px;">
        © ${new Date().getFullYear()} Academy of Tutorials. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function generateWelcomeEmailText(userName: string, userType: string): string {
  return `
Welcome to Academy of Tutorials! 🎉

Hi ${userName}!

Congratulations! Your email has been verified successfully, and your ${userType.toLowerCase()} account is now active.

You can now complete your profile and start ${userType === 'Teacher' ? 'connecting with guardians' : 'finding the perfect teacher for your child'}.

Visit your dashboard: ${(process.env.NEXT_PUBLIC_APP_URL || siteConfig.url || 'http://localhost:3000')}/dashboard

We’d love your feedback: ${(process.env.NEXT_PUBLIC_APP_URL || siteConfig.url || 'http://localhost:3000')}/feedback

Share with someone who may need: ${(process.env.NEXT_PUBLIC_APP_URL || siteConfig.url || 'http://localhost:3000')}

© ${new Date().getFullYear()} Academy of Tutorials. All rights reserved.
  `.trim();
}

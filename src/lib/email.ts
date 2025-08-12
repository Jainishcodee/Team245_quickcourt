import nodemailer from 'nodemailer'

// Create transporter for SMTP server
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_SERVER_PASSWORD || 'your-app-password',
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

// Email template for OTP
const createOtpEmailTemplate = (email: string, otp: string, userName: string) => {
  return {
    from: `"QuickCourt" <${process.env.EMAIL_SERVER_USER || 'noreply@quickcourt.com'}>`,
    to: email,
    subject: "Verify Your Email - QuickCourt",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - QuickCourt</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
          }
          .header { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
          }
          .content { 
            background: #f9fafb; 
            padding: 30px; 
            border-radius: 0 0 10px 10px;
          }
          .otp-box { 
            background: white; 
            border: 2px solid #10b981; 
            border-radius: 8px; 
            padding: 20px; 
            text-align: center; 
            margin: 20px 0;
          }
          .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #10b981; 
            letter-spacing: 5px;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #6b7280; 
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏸 QuickCourt</h1>
          <p>Sports Facility Booking Platform</p>
        </div>
        
        <div class="content">
          <h2>Hello ${userName}! 👋</h2>
          <p>Thank you for signing up with QuickCourt! To complete your registration, please verify your email address.</p>
          
          <div class="otp-box">
            <p><strong>Your verification code is:</strong></p>
            <div class="otp-code">${otp}</div>
            <p><small>This code will expire in 10 minutes</small></p>
          </div>
          
          <p><strong>How to use this code:</strong></p>
          <ol>
            <li>Go back to the QuickCourt verification page</li>
            <li>Enter the 5-digit code above</li>
            <li>Click "Verify & Continue"</li>
          </ol>
          
          <p><strong>Didn't receive the code?</strong></p>
          <ul>
            <li>Check your spam/junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes for delivery</li>
          </ul>
          
          <p>If you didn't create a QuickCourt account, you can safely ignore this email.</p>
          
          <p>Best regards,<br>The QuickCourt Team</p>
        </div>
        
        <div class="footer">
          <p>© 2024 QuickCourt. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      QuickCourt - Email Verification
      
      Hello ${userName}!
      
      Your verification code is: ${otp}
      
      This code will expire in 10 minutes.
      
      If you didn't create a QuickCourt account, you can safely ignore this email.
      
      Best regards,
      The QuickCourt Team
    `
  }
}

// Send OTP email
export const sendOtpEmail = async (email: string, otp: string, userName: string) => {
  try {
    const transporter = createTransporter()
    const mailOptions = createOtpEmailTemplate(email, otp, userName)
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
    
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Send welcome email after verification
export const sendWelcomeEmail = async (email: string, userName: string) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"QuickCourt" <${process.env.EMAIL_SERVER_USER || 'noreply@quickcourt.com'}>`,
      to: email,
      subject: "Welcome to QuickCourt! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to QuickCourt!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Welcome to QuickCourt!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Your email has been verified successfully! You can now:</p>
            <ul>
              <li>Sign in to your account</li>
              <li>Book sports facilities</li>
              <li>Join matches with other players</li>
              <li>Manage your profile</li>
            </ul>
            <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin" class="button">Sign In Now</a></p>
            <p>Welcome to the QuickCourt community! 🏸</p>
          </div>
        </body>
        </html>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Welcome email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
    
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
} 
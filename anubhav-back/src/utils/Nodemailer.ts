// Core email service dependencies
import { createTransport } from 'nodemailer';  // SMTP email transport
import dotenv from 'dotenv';                   // Environment variable loader

// Load SMTP credentials from .env file
dotenv.config();

// Configure email transporter with environment variables
const transporter = createTransport({
  host: process.env.SMTP_HOST,       // SMTP server address (e.g., smtp.gmail.com)
  port: Number(process.env.SMTP_PORT), // Secure port number (465 for SSL)
  secure: process.env.SMTP_SECURE === 'true', // Encryption enabled
  auth: {
    user: process.env.SMTP_USER,     // Authorized email account
    pass: process.env.SMTP_PASS      // App password/credentials
  }
});

// Verify SMTP connection during application startup
transporter.verify()
  .then(() => console.log('SMTP connection verified')) // Success confirmation
  .catch(error => { 
    console.error('SMTP connection failed:', error); // Connection error handling
    process.exit(1); // Critical failure - terminate application
  });

// Email template generator for password resets
const createResetTemplate = (code: string) => ({
  subject: 'Password Reset Code', // Email subject line
  html: `                         // Styled HTML content
    <div style="font-family: Arial; max-width: 600px; margin: auto;">
      <h2>Password Reset</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; 
                  text-align: center; font-size: 24px; margin: 20px 0;">
        ${code}                   <!-- Dynamic security code insertion -->
      </div>
      <p>Code expires in 15 minutes</p> <!-- Security notice -->
    </div>
  `
});

// Main email sending function with error handling
export async function sendPasswordResetCode(email: string, code: string) {
  // Validate input parameters
  if (!email || !code) throw new Error('Invalid email parameters');
  
  try {
    // Send email through configured transporter
    await transporter.sendMail({
      from: `"LMS System" <${process.env.SMTP_USER}>`, // Sender identity
      to: email,                                      // Recipient address
      ...createResetTemplate(code)                   // Apply generated template
    });
  } catch (error) {
    // Handle email sending failures
    console.error('Email send failed:', error);
    throw new Error('Failed to send password reset email');
  }
}

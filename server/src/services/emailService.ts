import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'nodemailer';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@example.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'HR Team';

let transporter: nodemailer.Transporter | null = null;

if (EMAIL_PROVIDER === 'sendgrid' && SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else if (EMAIL_PROVIDER === 'nodemailer') {
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
  const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
  const SMTP_USER = process.env.SMTP_USER || '';
  const SMTP_PASS = process.env.SMTP_PASS || '';

  if (SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  } else {
    console.warn('SMTP credentials not configured. Email functionality will be disabled.');
  }
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const from = `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`;

    if (EMAIL_PROVIDER === 'sendgrid' && SENDGRID_API_KEY) {
      const msg = {
        to: Array.isArray(options.to) ? options.to : [options.to],
        from,
        subject: options.subject,
        text: options.text || '',
        html: options.html || options.text || '',
        cc: options.cc,
        bcc: options.bcc,
      };

      await sgMail.send(msg);
      console.log(`Email sent via SendGrid to ${options.to}`);
      return true;
    } else if (transporter) {
      const info = await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
      });

      console.log(`Email sent via SMTP: ${info.messageId}`);
      return true;
    } else {
      console.warn('Email service not configured. Skipping email send.');
      return false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (to: string, name: string, role: string, startDate: string): Promise<boolean> => {
  const subject = `Welcome to the Team, ${name}!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome ${name}!</h2>
      <p>We're thrilled to have you join our team as a <strong>${role}</strong>.</p>
      <p>Your start date is <strong>${startDate}</strong>.</p>
      <h3>What to expect next:</h3>
      <ul>
        <li>You'll receive login credentials for your employee portal</li>
        <li>Your onboarding schedule will be available in the portal</li>
        <li>Your manager will reach out to schedule a welcome call</li>
      </ul>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Best regards,<br>${EMAIL_FROM_NAME}</p>
    </div>
  `;
  
  return sendEmail({ to, subject, html });
};

export const sendCredentialsEmail = async (
  to: string,
  name: string,
  temporaryPassword: string,
  loginUrl: string
): Promise<boolean> => {
  const subject = 'Your Employee Portal Access';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Employee Portal Access</h2>
      <p>Hi ${name},</p>
      <p>Your employee portal account has been created. Here are your login credentials:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${to}</p>
        <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 3px;">${temporaryPassword}</code></p>
        <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
      </div>
      <p><strong>Important:</strong> Please change your password after your first login.</p>
      <p>Best regards,<br>${EMAIL_FROM_NAME}</p>
    </div>
  `;
  
  return sendEmail({ to, subject, html });
};

export const sendOfferEmail = async (
  to: string,
  name: string,
  role: string,
  salary: string,
  startDate: string
): Promise<boolean> => {
  const subject = `Job Offer: ${role} at ${EMAIL_FROM_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Congratulations ${name}!</h2>
      <p>We are pleased to offer you the position of <strong>${role}</strong>.</p>
      <h3>Offer Details:</h3>
      <ul>
        <li><strong>Position:</strong> ${role}</li>
        <li><strong>Salary:</strong> ${salary}</li>
        <li><strong>Start Date:</strong> ${startDate}</li>
      </ul>
      <p>Please find the detailed offer letter attached.</p>
      <p>We look forward to having you on our team!</p>
      <p>Best regards,<br>${EMAIL_FROM_NAME}</p>
    </div>
  `;
  
  return sendEmail({ to, subject, html });
};

export const sendMeetingReminderEmail = async (
  to: string,
  name: string,
  meetingPurpose: string,
  meetingDate: string
): Promise<boolean> => {
  const subject = `Meeting Reminder: ${meetingPurpose}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Meeting Reminder</h2>
      <p>Hi ${name},</p>
      <p>This is a reminder about your upcoming meeting:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Purpose:</strong> ${meetingPurpose}</p>
        <p><strong>Date & Time:</strong> ${meetingDate}</p>
      </div>
      <p>See you there!</p>
      <p>Best regards,<br>${EMAIL_FROM_NAME}</p>
    </div>
  `;
  
  return sendEmail({ to, subject, html });
};

export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetToken: string,
  resetUrl: string
): Promise<boolean> => {
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>${EMAIL_FROM_NAME}</p>
    </div>
  `;
  
  return sendEmail({ to, subject, html });
};

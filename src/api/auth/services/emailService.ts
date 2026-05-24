import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@xchangeskills.com';
const APP_NAME = 'XchangeSkills';

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const link = `${frontendUrl}/verify-email?token=${token}`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${APP_NAME}" <${FROM}>`,
    to: email,
    subject: `Verify your ${APP_NAME} account`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0;">
  <div style="max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 36px 32px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700;">${APP_NAME}</h1>
    </div>
    <div style="padding: 36px 32px;">
      <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 12px;">Verify your email address</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
        Thanks for signing up! Click the button below to verify your email and activate your account.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${link}"
           style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; letter-spacing: 0.3px;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0; text-align: center;">
        This link expires in <strong>24 hours</strong>. If you didn't create an account, you can ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
        Or copy and paste this URL into your browser:<br>
        <span style="color: #6366f1; word-break: break-all;">${link}</span>
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const link = `${frontendUrl}/reset-password?token=${token}`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${APP_NAME}" <${FROM}>`,
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0;">
  <div style="max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 36px 32px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700;">${APP_NAME}</h1>
    </div>
    <div style="padding: 36px 32px;">
      <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 12px;">Reset your password</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
        We received a request to reset the password for your account. Click the button below to choose a new password.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${link}"
           style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; letter-spacing: 0.3px;">
          Reset Password
        </a>
      </div>
      <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0; text-align: center;">
        This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
        Or copy and paste this URL into your browser:<br>
        <span style="color: #6366f1; word-break: break-all;">${link}</span>
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}

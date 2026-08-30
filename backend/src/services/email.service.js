const nodemailer = require("nodemailer");

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

function getSenderEmail() {
  return (
    process.env.BREVO_SENDER_EMAIL ||
    process.env.SMTP_USER ||
    process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] ||
    null
  );
}

function getSenderName() {
  return process.env.BREVO_SENDER_NAME || "FinTrack";
}

function getEmailFrom() {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  const sender = getSenderEmail();
  if (sender) return `${getSenderName()} <${sender}>`;
  return "FinTrack <onboarding@resend.dev>";
}

function getSmtpConfig() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  };
}

let smtpTransporter = null;

function getSmtpTransporter() {
  const config = getSmtpConfig();
  if (!config) return null;
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport(config);
  }
  return smtpTransporter;
}

async function sendViaBrevo({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = getSenderEmail();
  if (!apiKey || !senderEmail) return null;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: getSenderName(), email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[email] Brevo error:", data);
    const detail = data?.message || data?.code || "Failed to send email";
    throw new Error(detail);
  }

  return { ok: true, id: data.messageId, provider: "brevo" };
}

async function sendViaSmtp({ to, subject, html }) {
  const transporter = getSmtpTransporter();
  if (!transporter) return null;

  const info = await transporter.sendMail({
    from: getEmailFrom(),
    to,
    subject,
    html,
  });

  return { ok: true, id: info.messageId, provider: "smtp" };
}

async function sendViaResend({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailFrom(),
      to: [to],
      subject,
      html,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[email] Resend error:", data);
    throw new Error(data?.message || "Failed to send email");
  }

  return { ok: true, id: data.id, provider: "resend" };
}

async function sendEmail({ to, subject, html }) {
  // Brevo HTTP API — works on Render FREE tier (no SMTP ports needed)
  try {
    const brevoResult = await sendViaBrevo({ to, subject, html });
    if (brevoResult) return brevoResult;
  } catch (err) {
    console.error("[email] Brevo error:", err.message);
    throw err;
  }

  // Resend HTTP API — needs verified domain to email anyone
  try {
    const resendResult = await sendViaResend({ to, subject, html });
    if (resendResult) return resendResult;
  } catch (err) {
    console.error("[email] Resend error:", err.message);
    throw err;
  }

  // Gmail SMTP — works locally or on PAID Render only (free tier blocks port 587)
  try {
    const smtpResult = await sendViaSmtp({ to, subject, html });
    if (smtpResult) return smtpResult;
  } catch (err) {
    console.error("[email] SMTP error:", err.message);
    if (err.code === "ETIMEDOUT" || err.code === "ESOCKET") {
      throw new Error(
        "SMTP blocked by hosting provider. Use BREVO_API_KEY on Render free tier instead of Gmail SMTP."
      );
    }
    throw err;
  }

  console.warn("[email] No email provider configured — email not sent to:", to);
  return { ok: false, skipped: true };
}

function verificationEmailHtml(verifyUrl) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#38bdf8">Verify your FinTrack email</h2>
      <p>Thanks for signing up! Click the button below to verify your email and start using FinTrack.</p>
      <p style="margin:28px 0">
        <a href="${verifyUrl}" style="background:linear-gradient(135deg,#0891b2,#6366f1);color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block">
          Verify email
        </a>
      </p>
      <p style="color:#64748b;font-size:14px">Or copy this link:<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p style="color:#64748b;font-size:13px">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
    </div>
  `;
}

function emailChangeHtml(confirmUrl, newEmail) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#38bdf8">Confirm your new email</h2>
      <p>You requested to change your FinTrack email to <strong>${newEmail}</strong>.</p>
      <p style="margin:28px 0">
        <a href="${confirmUrl}" style="background:linear-gradient(135deg,#0891b2,#6366f1);color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block">
          Confirm new email
        </a>
      </p>
      <p style="color:#64748b;font-size:14px">Or copy this link:<br/><a href="${confirmUrl}">${confirmUrl}</a></p>
      <p style="color:#64748b;font-size:13px">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
    </div>
  `;
}

async function sendVerificationEmail(to, token) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Verify your FinTrack email",
    html: verificationEmailHtml(verifyUrl),
  });
}

async function sendEmailChangeConfirmation(to, token) {
  const confirmUrl = `${FRONTEND_URL}/confirm-email-change?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Confirm your new FinTrack email",
    html: emailChangeHtml(confirmUrl, to),
  });
}

function passwordResetHtml(resetUrl) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#38bdf8">Reset your FinTrack password</h2>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      <p style="margin:28px 0">
        <a href="${resetUrl}" style="background:linear-gradient(135deg,#0891b2,#6366f1);color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block">
          Reset password
        </a>
      </p>
      <p style="color:#64748b;font-size:14px">Or copy this link:<br/><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="color:#64748b;font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `;
}

async function sendPasswordResetEmail(to, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Reset your FinTrack password",
    html: passwordResetHtml(resetUrl),
  });
}

module.exports = {
  sendVerificationEmail,
  sendEmailChangeConfirmation,
  sendPasswordResetEmail,
};

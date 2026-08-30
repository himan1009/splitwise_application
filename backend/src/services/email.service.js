const nodemailer = require("nodemailer");

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

function getSmtpConfig() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  };
}

function getEmailFrom() {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  if (process.env.SMTP_USER) return `FinTrack <${process.env.SMTP_USER}>`;
  return "FinTrack <onboarding@resend.dev>";
}

async function sendViaSmtp({ to, subject, html }) {
  const config = getSmtpConfig();
  if (!config) return null;

  const transporter = nodemailer.createTransport(config);
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
  // Gmail SMTP — sends to ANY email, no domain needed (best for indie apps)
  try {
    const smtpResult = await sendViaSmtp({ to, subject, html });
    if (smtpResult) return smtpResult;
  } catch (err) {
    console.error("[email] SMTP error:", err.message);
    throw err;
  }

  // Resend — only works for all users after you verify a custom domain
  try {
    const resendResult = await sendViaResend({ to, subject, html });
    if (resendResult) return resendResult;
  } catch (err) {
    console.error("[email] Resend error:", err.message);
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

module.exports = {
  sendVerificationEmail,
  sendEmailChangeConfirmation,
};

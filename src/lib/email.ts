import "server-only";

import { Resend } from "resend";

interface TransactionalEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface TransactionalEmailResult {
  ok: boolean;
  id?: string;
  skipped?: boolean;
  error?: string;
}

let resendClient: Resend | null = null;

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  return {
    apiKey,
    from,
    adminEmail,
    ready: Boolean(apiKey && from && adminEmail),
  };
}

function getResendClient(apiKey: string) {
  resendClient ??= new Resend(apiKey);
  return resendClient;
}

export function getAdminNotificationEmail() {
  return process.env.ADMIN_NOTIFICATION_EMAIL;
}

export function isEmailDeliveryConfigured() {
  return getEmailConfig().ready;
}

/** Absolute origin for links in outbound email, which has no request context. */
export function getSiteBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "https://westernwheelcraft.ca";
}

export async function sendTransactionalEmail(
  input: TransactionalEmailInput
): Promise<TransactionalEmailResult> {
  const config = getEmailConfig();

  if (!config.ready || !config.apiKey || !config.from) {
    console.warn("Skipping transactional email: Resend environment variables are not fully configured.");
    return {
      ok: false,
      skipped: true,
      error: "Resend environment variables are not fully configured.",
    };
  }

  try {
    const response = await getResendClient(config.apiKey).emails.send({
      from: config.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    if (response.error) {
      console.error("Resend email send failed", response.error);
      return {
        ok: false,
        error: response.error.message,
      };
    }

    return {
      ok: true,
      id: response.data?.id,
    };
  } catch (error) {
    console.error("Resend email send threw", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Resend error.",
    };
  }
}

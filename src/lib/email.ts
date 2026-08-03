import "server-only";

import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
/** e.g. `SK Bags <orders@skbags.com>` — the domain must be verified in Resend. */
const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO;
/** Optional internal address that gets a copy of every order confirmation. */
export const EMAIL_ADMIN = process.env.EMAIL_ADMIN;

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(RESEND_API_KEY);
  return resend;
}

/** Whether email is configured at all. Callers use it to skip work early. */
export const emailEnabled = Boolean(RESEND_API_KEY && EMAIL_FROM);

export type EmailKind = "order_confirmation" | "order_recovery" | "cart_recovery";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  kind: EmailKind;
  orderId?: string | null;
  /** Addresses that get a blind copy — used for the shop's own notification. */
  bcc?: string[];
};

export type SendEmailResult = {
  sent: boolean;
  providerId?: string;
  error?: string;
};

async function log(
  input: SendEmailInput,
  status: "sent" | "failed" | "skipped",
  extra: { providerId?: string; error?: string } = {}
) {
  try {
    await supabaseAdmin.from("email_log").insert({
      order_id: input.orderId || null,
      kind: input.kind,
      recipient: input.to,
      subject: input.subject,
      status,
      provider_id: extra.providerId || null,
      error: extra.error ? String(extra.error).slice(0, 500) : null,
    });
  } catch (error: any) {
    // The log is a diagnostic, never a gate — a logging failure must not
    // turn a delivered email into a reported failure, or a failed one into
    // an exception that aborts the caller's request.
    console.error("email_log insert failed:", error?.message);
  }
}

/**
 * Sends one email through Resend and records the outcome.
 *
 * Never throws. Every caller is on a path where the money side of the work
 * has already succeeded — an order is paid, or a sweep is mid-batch — and an
 * unreachable mail provider must not be able to fail that.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const client = getResend();

  if (!client || !EMAIL_FROM) {
    const reason = !RESEND_API_KEY ? "RESEND_API_KEY is not set" : "EMAIL_FROM is not set";
    console.warn(`Email skipped (${input.kind}): ${reason}`);
    await log(input, "skipped", { error: reason });
    return { sent: false, error: reason };
  }

  try {
    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: [input.to],
      bcc: input.bcc?.length ? input.bcc : undefined,
      replyTo: EMAIL_REPLY_TO || undefined,
      subject: input.subject,
      html: input.html,
      text: input.text,
      tags: [{ name: "kind", value: input.kind }],
    });

    if (error) {
      console.error(`Resend error (${input.kind}):`, error.message);
      await log(input, "failed", { error: error.message });
      return { sent: false, error: error.message };
    }

    await log(input, "sent", { providerId: data?.id });
    return { sent: true, providerId: data?.id };
  } catch (error: any) {
    console.error(`Email send threw (${input.kind}):`, error?.message);
    await log(input, "failed", { error: error?.message || "unknown error" });
    return { sent: false, error: error?.message || "unknown error" };
  }
}

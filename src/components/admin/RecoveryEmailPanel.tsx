"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Loader2, CheckCircle2, Info, AlertTriangle, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getClientToken } from "@/lib/auth";

/**
 * The token stored at login is a snapshot — Supabase access tokens last an
 * hour, and an admin panel is exactly the kind of tab that stays open longer
 * than that. Asking the client for the session returns a refreshed token
 * instead, so a long-open dialog doesn't start failing with "session expired".
 */
async function authHeader(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return `Bearer ${data.session.access_token}`;
  } catch {
    // Fall through to the stored copy.
  }
  return `Bearer ${getClientToken() || ""}`;
}

type Eligibility = {
  canSend: boolean;
  code: string;
  message: string;
  hasPhone?: boolean;
  channels?: {
    email: { canSend: boolean; code: string; message: string };
    whatsapp: { canSend: boolean; code: string; message: string };
  };
  discountOptions?: {
    enabled: boolean;
    defaultPercent: number;
    maxPercent: number;
    presets: number[];
  };
  order?: {
    total: number;
    subtotal: number;
    recoverySentAt: string | null;
    recoveryDiscountPercent: number | null;
    recoveryDiscountAmount: number | null;
  };
  cart?: {
    subtotal: number;
    itemCount: number;
    recoverySentAt: string | null;
    recoveryPromoCode: string | null;
    recoveryDiscountPercent: number | null;
  };
};

/** One line saying whether a channel is open, and why not when it isn't. */
function ChannelNote({
  label,
  canSend,
  code,
  message,
}: {
  label?: string;
  canSend: boolean;
  code: string;
  message: string;
}) {
  const informational = code === "already-sent" || code === "customer-already-chased";
  const tone = canSend
    ? "bg-emerald-50 text-emerald-800"
    : informational
      ? "bg-blue-50 text-blue-800"
      : "bg-amber-50 text-amber-800";
  const Icon = canSend ? CheckCircle2 : informational ? Info : AlertTriangle;

  return (
    <div className={`mb-3 flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs leading-relaxed ${tone}`}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        {label ? <strong className="font-semibold">{label}: </strong> : null}
        {message}
      </span>
    </div>
  );
}

const formatEgp = (value: number) =>
  `EGP ${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

/**
 * The "send the customer a follow-up" control for one order.
 *
 * Deliberately asks the server whether it may send, rather than working it out
 * from the order row on screen: the rules span the customer's other orders, and
 * a dialog that has been open for ten minutes has no idea what happened in them.
 */
export default function RecoveryEmailPanel({
  orderId,
  sessionId,
  title = "Recovery email",
  onSent,
}: {
  /** Chase an abandoned order — has a price to discount and a payment page. */
  orderId?: string;
  /** Chase an abandoned cart — no order exists, so the discount is a code. */
  sessionId?: string;
  title?: string;
  onSent?: () => void;
}) {
  // One control, two endpoints. The rules and the refusal messages live on the
  // server in both cases, so the panel never has to know which flow it is in.
  const endpoint = orderId
    ? `/api/admin/orders/${orderId}/recovery`
    : `/api/admin/carts/${encodeURIComponent(String(sessionId))}/recovery`;
  const [state, setState] = useState<Eligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<"email" | "whatsapp" | null>(null);
  const [percent, setPercent] = useState<number>(0);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [undoing, setUndoing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(endpoint, {
        headers: { Authorization: await authHeader() },
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        setState({ canSend: false, code: "error", message: data?.message || "Couldn't load." });
      } else {
        setState(data);
        setPercent(data?.discountOptions?.defaultPercent ?? 0);
      }
    } catch {
      setState({ canSend: false, code: "error", message: "Couldn't reach the server." });
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async (channel: "email" | "whatsapp") => {
    setSending(channel);
    setResult(null);

    // Opened before the request, not after: a tab opened from inside an async
    // callback is a popup as far as the browser is concerned, and gets blocked.
    // This one is navigated once the server answers, or closed if it refuses.
    const waTab = channel === "whatsapp" ? window.open("", "_blank") : null;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: await authHeader(),
        },
        body: JSON.stringify({ discountPercent: percent, channel }),
      });
      const data = await response.json();
      setResult({ ok: Boolean(data?.succeeded), message: data?.message || "" });

      if (data?.succeeded && data?.whatsappUrl) {
        if (waTab) waTab.location.href = data.whatsappUrl;
        else window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      } else if (waTab) {
        waTab.close();
      }

      if (data?.succeeded) onSent?.();
      // Either way the state moved — re-read rather than guess at it.
      await load();
    } catch {
      waTab?.close();
      setResult({ ok: false, message: "Couldn't reach the server." });
    } finally {
      setSending(null);
    }
  };

  /**
   * Puts the price back. The message itself cannot be recalled, so the
   * confirmation says exactly what the customer will experience rather than
   * asking a vague "are you sure?".
   */
  const undoDiscount = async () => {
    const confirmed = window.confirm(
      "The customer has already been sent the discounted price. Reversing it means " +
        "the payment page will now ask for the full amount, which they are likely to " +
        "notice.\n\nReverse the discount anyway?"
    );
    if (!confirmed) return;

    setUndoing(true);
    setResult(null);
    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: await authHeader() },
      });
      const data = await response.json();
      setResult({ ok: Boolean(data?.succeeded), message: data?.message || "" });
      if (data?.succeeded) onSent?.();
      await load();
    } catch {
      setResult({ ok: false, message: "Couldn't reach the server." });
    } finally {
      setUndoing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking whether a follow-up can be sent…
      </div>
    );
  }

  if (!state) return null;

  const discount = state.discountOptions;
  const email = state.channels?.email ?? {
    canSend: state.canSend,
    code: state.code,
    message: state.message,
  };
  const whatsapp = state.channels?.whatsapp ?? {
    canSend: false,
    code: "unavailable",
    message: "WhatsApp isn't available for this record.",
  };
  // The discount is a property of the contact, not of the channel — so the
  // picker shows whenever either way of reaching them is open.
  const anyChannel = email.canSend || whatsapp.canSend;
  const showDiscountPicker = anyChannel && discount?.enabled;

  // An order gets its price cut on the spot, so the panel can show the exact
  // new total. A cart has no price yet — the code is applied at checkout,
  // against whatever is in the basket by then — so promising a figure here
  // would be inventing one.
  const isOrder = Boolean(state.order);
  // WhatsApp needs a number. The server refuses without one anyway; disabling
  // the button says so before the click instead of after.
  const hasPhone = Boolean(state.hasPhone);
  // Mirrors the cap the server applies: the charge can never reach zero, or
  // the gateway refuses to open a payment page at all. Without this the panel
  // would promise a discount bigger than the one actually granted.
  const rawEstimate = state.order ? (state.order.subtotal * percent) / 100 : 0;
  const ceiling = state.order ? Math.max(0, state.order.total - 1) : 0;
  const estimated = Math.min(rawEstimate, ceiling);
  const capped = estimated < rawEstimate - 0.005;
  const newTotal = state.order ? Math.max(0, state.order.total - estimated) : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Mail className="h-4 w-4 text-indigo-600" />
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      </div>

      {/* Why each channel is or isn't available. Never a bare disabled button —
          the reason is the whole point of this panel. Shown once when both
          channels agree, and split when they don't. */}
      {email.message === whatsapp.message ? (
        <ChannelNote canSend={email.canSend} code={email.code} message={email.message} />
      ) : (
        <div className="mb-3 space-y-2">
          <ChannelNote
            label="Email"
            canSend={email.canSend}
            code={email.code}
            message={email.message}
          />
          <ChannelNote
            label="WhatsApp"
            canSend={whatsapp.canSend}
            code={whatsapp.code}
            message={whatsapp.message}
          />
        </div>
      )}

      {state.order?.recoveryDiscountAmount ? (
        <div className="mb-3 flex items-start justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-600">
            {state.order.recoveryDiscountPercent}% (
            {formatEgp(state.order.recoveryDiscountAmount)}) is already off this order.
          </p>
          <button
            type="button"
            disabled={undoing}
            onClick={undoDiscount}
            className="shrink-0 text-xs font-semibold text-red-600 underline underline-offset-2 disabled:text-gray-400"
          >
            {undoing ? "Reversing…" : "Undo"}
          </button>
        </div>
      ) : null}

      {state.cart?.recoveryPromoCode ? (
        <p className="mb-3 text-xs text-gray-500">
          Code issued: <strong className="font-mono">{state.cart.recoveryPromoCode}</strong>
          {state.cart.recoveryDiscountPercent ? ` (${state.cart.recoveryDiscountPercent}%)` : ""}
        </p>
      ) : null}

      {showDiscountPicker && (
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600">Discount to offer</label>
            <span className="text-xs text-gray-500">
              {percent === 0 ? (
                "No discount"
              ) : isOrder ? (
                <>
                  {capped && <span className="text-amber-600">capped </span>}
                  −{formatEgp(estimated)} → <strong>{formatEgp(newTotal)}</strong>
                </>
              ) : (
                <>single-use {percent}% code</>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[0, ...(discount?.presets || [])].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPercent(value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  percent === value
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {value === 0 ? "None" : `${value}%`}
              </button>
            ))}
            <input
              type="number"
              min={0}
              max={discount?.maxPercent ?? 30}
              value={percent}
              onChange={(event) => {
                const next = Number(event.target.value);
                const max = discount?.maxPercent ?? 30;
                setPercent(Number.isFinite(next) ? Math.min(Math.max(next, 0), max) : 0);
              }}
              className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
              aria-label="Custom discount percent"
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
            {isOrder
              ? `Applied to this order immediately and only once — the customer pays the new total straight from the email. Max ${discount?.maxPercent}%.`
              : `Creates a single-use code tied to this cart, valid for a limited time. Nothing is charged or reserved until they check out. Max ${discount?.maxPercent}%.`}
          </p>
        </div>
      )}

      {/* Two ways to reach the same person, sharing one set of rules: whichever
          is used, the other is blocked for the next 72 hours. */}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!email.canSend || sending !== null}
          onClick={() => send("email")}
          className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          {sending === "email" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <Mail className="h-4 w-4" />
              Email{percent > 0 && email.canSend ? ` · ${percent}%` : ""}
            </span>
          )}
        </button>

        <button
          type="button"
          disabled={!whatsapp.canSend || sending !== null || !hasPhone}
          title={hasPhone ? undefined : "No phone number on this record"}
          onClick={() => send("whatsapp")}
          className="flex-1 rounded-lg bg-[#075E54] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#064d44] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          {sending === "whatsapp" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              WhatsApp{percent > 0 && whatsapp.canSend ? ` · ${percent}%` : ""}
            </span>
          )}
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
        Both can go to the same customer. Each channel sends once per 72 hours, and the
        discount is applied once whichever way you reach them.
      </p>

      {result && (
        <p
          className={`mt-2 text-xs ${result.ok ? "text-emerald-700" : "text-red-600"}`}
          role="status"
        >
          {result.message}
        </p>
      )}
    </div>
  );
}

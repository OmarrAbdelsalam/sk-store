"use client";

import { useId, useState } from "react";

/**
 * Payment brand marks for the checkout.
 *
 * Each mark first tries an official asset at /public/payment/<slug>.svg and
 * falls back to a drawn mark if it isn't there. Drop the real files in and the
 * badges upgrade themselves with no code change — the fallbacks exist so the
 * page never renders a broken image while those assets are missing.
 *
 * Trademarks belong to their respective owners and are shown here only to
 * indicate accepted payment methods.
 */

type BrandProps = { className?: string };

function Badge({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span
      title={label}
      className="inline-flex items-center justify-center h-7 min-w-[42px] px-2 rounded-md border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] select-none"
    >
      {children}
    </span>
  );
}

/** Official asset if present, drawn mark otherwise. */
function BrandMark({
  slug,
  label,
  children,
}: {
  slug: string;
  label: string;
  children: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <Badge label={label}>
      {failed ? (
        children
      ) : (
        // Not lazy-loaded: these are trust signals sitting right beside the pay
        // button, and deferring them means they arrive after the customer has
        // already decided.
        <img
          src={`/payment/${slug}.svg`}
          alt={label}
          className="h-4 w-auto max-w-[46px] object-contain"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </Badge>
  );
}

export function VisaMark() {
  return (
    <BrandMark slug="visa" label="Visa">
      <span className="text-[13px] font-black italic tracking-[-0.06em] text-[#1434CB] leading-none">
        VISA
      </span>
    </BrandMark>
  );
}

export function MastercardMark() {
  // Two interlocking circles with the overlap in its own colour. The clip is
  // what makes it read as the real mark rather than two translucent dots.
  const clipId = useId();

  return (
    <BrandMark slug="mastercard" label="Mastercard">
      <svg viewBox="0 0 48 30" className="h-4 w-auto" role="img" aria-label="Mastercard">
        <defs>
          <clipPath id={clipId}>
            <circle cx="17" cy="15" r="14" />
          </clipPath>
        </defs>
        <circle cx="17" cy="15" r="14" fill="#EB001B" />
        <circle cx="31" cy="15" r="14" fill="#F79E1B" />
        <g clipPath={`url(#${clipId})`}>
          <circle cx="31" cy="15" r="14" fill="#FF5F00" />
        </g>
      </svg>
    </BrandMark>
  );
}

export function MeezaMark() {
  return (
    <BrandMark slug="meeza" label="Meeza">
      <span className="text-[10px] font-black tracking-wide text-[#005B38] leading-none">
        meeza
      </span>
    </BrandMark>
  );
}

export function InstaPayMark() {
  return (
    <BrandMark slug="instapay" label="InstaPay">
      <span className="text-[10px] font-bold tracking-tight text-[#3E115D] leading-none">
        InstaPay
      </span>
    </BrandMark>
  );
}

export function WalletsMark({ isAr = false }: BrandProps & { isAr?: boolean }) {
  const label = isAr ? "محافظ إلكترونية" : "Mobile wallets";

  return (
    <BrandMark slug="wallets" label={label}>
      <span className="inline-flex items-center gap-1 leading-none">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-gray-600" fill="none" aria-hidden="true">
          <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 12h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="text-[10px] font-bold text-gray-700">
          {isAr ? "محافظ" : "Wallets"}
        </span>
      </span>
    </BrandMark>
  );
}

export function FawryMark() {
  return (
    <BrandMark slug="fawry" label="Fawry">
      <span className="text-[10px] font-black tracking-tight text-[#FDB913] leading-none drop-shadow-[0_0_1px_rgba(0,0,0,0.35)]">
        fawry
      </span>
    </BrandMark>
  );
}

/**
 * Every method the gateway offers, shown once. These apply to both payment
 * plans — splitting them across the two options implied that choosing a deposit
 * ruled out paying by card, which is not true and cost conversions.
 */
export function AcceptedPaymentBrands({ isAr = false }: { isAr?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <VisaMark />
      <MastercardMark />
      <MeezaMark />
      <WalletsMark isAr={isAr} />
      <InstaPayMark />
      <FawryMark />
    </div>
  );
}

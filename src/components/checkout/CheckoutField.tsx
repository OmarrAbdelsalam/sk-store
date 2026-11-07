"use client";

import * as React from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shopify-checkout fields: the label sits inside the box as the placeholder,
 * and once there is a value it shrinks to a 12px caption above the text.
 * 52px tall, 1px gray border, ink border + ring on focus, red on error.
 * 16px text on phones (stops iOS zooming in), 14px from md up.
 */

const box =
  "w-full rounded-none border border-gray-300 bg-white px-3 font-sans text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-fast md:text-[14px] " +
  "hover:border-gray-400 focus:border-ink focus:ring-1 focus:ring-ink " +
  "disabled:cursor-not-allowed disabled:bg-beige disabled:text-gray-500 disabled:hover:border-gray-300";

const errorBox = "border-danger hover:border-danger focus:border-danger focus:ring-danger";

const floatingLabel =
  "pointer-events-none absolute start-3 top-[7px] max-w-[calc(100%-1.5rem)] truncate font-sans text-[12px] leading-4 text-gray-500 transition-[opacity,transform] duration-fast";

type Common = {
  id: string;
  label: string;
  error?: string | null;
  hint?: React.ReactNode;
  /** Icon shown at the end of the box (help, lock…). */
  endAdornment?: React.ReactNode;
  wrapperClassName?: string;
};

function Message({ id, error, hint }: { id: string; error?: string | null; hint?: React.ReactNode }) {
  if (error) {
    return (
      <p id={`${id}-msg`} className="mt-1.5 flex items-start gap-1.5 font-sans text-[13px] leading-5 text-danger">
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.5} />
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={`${id}-msg`} className="mt-1.5 font-sans text-[13px] leading-5 text-gray-500">
        {hint}
      </p>
    );
  }
  return null;
}

export const CheckoutInput = React.forwardRef<
  HTMLInputElement,
  Common & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id">
>(({ id, label, error, hint, endAdornment, wrapperClassName, className, ...props }, ref) => (
  <div className={wrapperClassName}>
    <div className="relative">
      <input
        ref={ref}
        id={id}
        placeholder={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={cn(
          box,
          "peer h-[52px] placeholder:text-gray-500 [&:not(:placeholder-shown)]:pb-1 [&:not(:placeholder-shown)]:pt-[18px]",
          endAdornment && "pe-10",
          error && errorBox,
          className
        )}
        {...props}
      />
      <label htmlFor={id} className={cn(floatingLabel, "peer-placeholder-shown:translate-y-1 peer-placeholder-shown:opacity-0")}>
        {label}
      </label>
      {endAdornment && (
        <span className="pointer-events-none absolute end-3 top-1/2 flex -translate-y-1/2 text-gray-500">
          {endAdornment}
        </span>
      )}
    </div>
    <Message id={id} error={error} hint={hint} />
  </div>
));
CheckoutInput.displayName = "CheckoutInput";

export function CheckoutSelect({
  id,
  label,
  error,
  hint,
  wrapperClassName,
  className,
  placeholder,
  options,
  value,
  ...props
}: Common &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
    placeholder?: string;
    options: { value: string; label: string }[];
  }) {
  return (
    <div className={wrapperClassName}>
      <div className="relative">
        <select
          id={id}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={cn(
            box,
            "h-[52px] cursor-pointer appearance-none pb-1 pe-10 pt-[18px]",
            !value && "text-gray-500",
            error && errorBox,
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-ink">
              {o.label}
            </option>
          ))}
        </select>
        <label htmlFor={id} className={floatingLabel}>
          {label}
        </label>
        <ChevronDown
          className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-gray-500"
          strokeWidth={1.5}
        />
      </div>
      <Message id={id} error={error} hint={hint} />
    </div>
  );
}

/** Section heading — sentence case, as Shopify's checkout sets them. */
export function CheckoutHeading({
  id,
  children,
  aside,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3.5 flex items-baseline justify-between gap-4", className)}>
      <h2 id={id} className="font-display text-[21px] font-medium leading-7 text-ink">{children}</h2>
      {aside}
    </div>
  );
}

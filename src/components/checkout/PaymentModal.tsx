"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, CreditCard, Wallet, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

type PaymentMethod = "visa" | "wallet";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paymentMethod: PaymentMethod;
  totalAmount: string;
};

type WalletStep = "credentials" | "otp" | "success";
type VisaStep = "card" | "otp" | "success";

export default function PaymentModal({ isOpen, onClose, onSuccess, paymentMethod, totalAmount }: Props) {
  const locale = useLocale();
  const isAr = locale === "ar";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e0d8]">
          <div className="flex items-center gap-2">
            {paymentMethod === "visa" ? (
              <CreditCard className="w-5 h-5 text-foreground" />
            ) : (
              <Wallet className="w-5 h-5 text-foreground" />
            )}
            <h2 className="text-sm font-medium tracking-wider uppercase">
              {paymentMethod === "visa" 
                ? (isAr ? "الدفع بالبطاقة" : "Card Payment")
                : (isAr ? "الدفع بالمحفظة" : "Wallet Payment")
              }
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-sm transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount */}
        <div className="px-6 py-3 bg-[#F0EBE3] border-b border-[#e8e0d8]">
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-wider uppercase text-muted-foreground">
              {isAr ? "المبلغ المطلوب" : "Amount to pay"}
            </span>
            <span className="text-lg font-semibold">{totalAmount} {isAr ? "جنيه" : "EGP"}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentMethod === "visa" ? (
            <VisaFlow isAr={isAr} onSuccess={onSuccess} />
          ) : (
            <WalletFlow isAr={isAr} onSuccess={onSuccess} />
          )}
        </div>

        {/* Security note */}
        <div className="px-6 pb-4 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground tracking-wider uppercase">
          <Lock className="w-3 h-3" />
          <span>{isAr ? "اتصال آمن ومشفر" : "Secure & encrypted connection"}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Visa Flow ───────────────────────────────────────────────────────────────

function VisaFlow({ isAr, onSuccess }: { isAr: boolean; onSuccess: () => void }) {
  const [step, setStep] = useState<VisaStep>("card");
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleCardSubmit = () => {
    if (!cardNumber || !expiry || !cvv || !cardName) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = () => {
    if (otp.some(d => !d)) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
      setTimeout(onSuccess, 1500);
    }, 2000);
  };

  if (step === "success") {
    return <SuccessState isAr={isAr} />;
  }

  if (step === "otp") {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">
            {isAr ? "أدخل رمز التحقق" : "Enter verification code"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isAr 
              ? "تم إرسال رمز مكون من 6 أرقام إلى رقمك المسجل" 
              : "A 6-digit code was sent to your registered number"}
          </p>
        </div>

        <div className="flex justify-center gap-2" dir="ltr">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { otpRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              className="w-10 h-12 text-center text-lg font-semibold border border-[#c8bdb0] rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground shadow-sm"
            />
          ))}
        </div>

        <button
          onClick={handleOtpSubmit}
          disabled={otp.some(d => !d) || isLoading}
          className={cn(
            "w-full h-12 bg-foreground text-background text-sm font-medium tracking-widest uppercase rounded-sm transition-all",
            "hover:bg-foreground/90",
            (otp.some(d => !d) || isLoading) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isAr ? "جاري التحقق..." : "Verifying..."}
            </span>
          ) : (
            isAr ? "تأكيد" : "Confirm"
          )}
        </button>

        <button className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wider uppercase">
          {isAr ? "إعادة إرسال الرمز" : "Resend code"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Card Number */}
      <div>
        <label className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-1.5 block">
          {isAr ? "رقم البطاقة" : "Card Number"}
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="0000 0000 0000 0000"
          dir="ltr"
          className="w-full h-11 px-3 text-sm border border-[#c8bdb0] rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground shadow-sm"
        />
      </div>

      {/* Card Name */}
      <div>
        <label className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-1.5 block">
          {isAr ? "الاسم على البطاقة" : "Cardholder Name"}
        </label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder={isAr ? "الاسم كما هو على البطاقة" : "Name as shown on card"}
          className="w-full h-11 px-3 text-sm border border-[#c8bdb0] rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground shadow-sm"
        />
      </div>

      {/* Expiry & CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-1.5 block">
            {isAr ? "تاريخ الانتهاء" : "Expiry"}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            dir="ltr"
            className="w-full h-11 px-3 text-sm border border-[#c8bdb0] rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground shadow-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-1.5 block">
            CVV
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="•••"
            dir="ltr"
            className="w-full h-11 px-3 text-sm border border-[#c8bdb0] rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground shadow-sm"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleCardSubmit}
        disabled={!cardNumber || !expiry || !cvv || !cardName || isLoading}
        className={cn(
          "w-full h-12 bg-foreground text-background text-sm font-medium tracking-widest uppercase rounded-sm transition-all mt-2",
          "hover:bg-foreground/90",
          (!cardNumber || !expiry || !cvv || !cardName || isLoading) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isAr ? "جاري المعالجة..." : "Processing..."}
          </span>
        ) : (
          isAr ? "ادفع الآن" : "Pay Now"
        )}
      </button>
    </div>
  );
}

// ─── Wallet Flow ─────────────────────────────────────────────────────────────

function WalletFlow({ isAr, onSuccess }: { isAr: boolean; onSuccess: () => void }) {
  const [step, setStep] = useState<WalletStep>("credentials");
  const [isLoading, setIsLoading] = useState(false);
  const [walletPhone, setWalletPhone] = useState("");
  const [walletPin, setWalletPin] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCredentialsSubmit = () => {
    if (!walletPhone || !walletPin) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = () => {
    if (otp.some(d => !d)) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
      setTimeout(onSuccess, 1500);
    }, 2000);
  };

  if (step === "success") {
    return <SuccessState isAr={isAr} />;
  }

  if (step === "otp") {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">
            {isAr ? "أدخل رمز التحقق" : "Enter OTP"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isAr 
              ? `تم إرسال رمز مكون من 6 أرقام إلى ${walletPhone}` 
              : `A 6-digit code was sent to ${walletPhone}`}
          </p>
        </div>

        <div className="flex justify-center gap-2" dir="ltr">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { otpRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              className="w-10 h-12 text-center text-lg font-semibold border border-[#c8bdb0] rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground shadow-sm"
            />
          ))}
        </div>

        <button
          onClick={handleOtpSubmit}
          disabled={otp.some(d => !d) || isLoading}
          className={cn(
            "w-full h-12 bg-foreground text-background text-sm font-medium tracking-widest uppercase rounded-sm transition-all",
            "hover:bg-foreground/90",
            (otp.some(d => !d) || isLoading) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isAr ? "جاري التحقق..." : "Verifying..."}
            </span>
          ) : (
            isAr ? "تأكيد الدفع" : "Confirm Payment"
          )}
        </button>

        <button className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wider uppercase">
          {isAr ? "إعادة إرسال الرمز" : "Resend code"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Wallet Phone */}
      <div>
        <label className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-1.5 block">
          {isAr ? "رقم المحفظة" : "Wallet Number"}
        </label>
        <input
          type="tel"
          inputMode="tel"
          value={walletPhone}
          onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
          placeholder="01xxxxxxxxx"
          dir="ltr"
          className="w-full h-11 px-3 text-sm border border-[#c8bdb0] rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground shadow-sm"
        />
      </div>

      {/* PIN */}
      <div>
        <label className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-1.5 block">
          {isAr ? "الرقم السري" : "PIN"}
        </label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={walletPin}
          onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="••••••"
          dir="ltr"
          className="w-full h-11 px-3 text-sm border border-[#c8bdb0] rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground shadow-sm"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleCredentialsSubmit}
        disabled={!walletPhone || !walletPin || isLoading}
        className={cn(
          "w-full h-12 bg-foreground text-background text-sm font-medium tracking-widest uppercase rounded-sm transition-all mt-2",
          "hover:bg-foreground/90",
          (!walletPhone || !walletPin || isLoading) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isAr ? "جاري التحقق..." : "Verifying..."}
          </span>
        ) : (
          isAr ? "متابعة" : "Continue"
        )}
      </button>
    </div>
  );
}

// ─── Success State ───────────────────────────────────────────────────────────

function SuccessState({ isAr }: { isAr: boolean }) {
  return (
    <div className="text-center py-6 space-y-3">
      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-7 h-7 text-green-600" />
      </div>
      <p className="text-sm font-medium">
        {isAr ? "تم الدفع بنجاح!" : "Payment Successful!"}
      </p>
      <p className="text-xs text-muted-foreground">
        {isAr ? "جاري تأكيد طلبك..." : "Confirming your order..."}
      </p>
    </div>
  );
}

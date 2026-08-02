"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart,
  RefreshCw,
  MessageCircle,
  Package,
  Wallet,
  UserCheck,
  Clock,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader, Card } from "@/components/admin/common";
import { Button } from "@/components/ui/button";
import {
  abandonedCartsService,
  buildRecoveryLink,
  STALE_AFTER_MINUTES,
  type AbandonedCart,
} from "@/services/admin/abandonedCarts";

type Tab = "carts" | "products";

const RANGE_OPTIONS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

const STAGE_LABELS: Record<string, { text: string; className: string }> = {
  cart: { text: "Cart only", className: "bg-gray-100 text-gray-700" },
  checkout_viewed: { text: "Opened checkout", className: "bg-blue-100 text-blue-800" },
  contact_entered: { text: "Left contact", className: "bg-amber-100 text-amber-800" },
  address_entered: { text: "Left address", className: "bg-orange-100 text-orange-800" },
  order_submitted: { text: "Order placed, unpaid", className: "bg-red-100 text-red-800" },
  payment_started: { text: "Reached payment", className: "bg-red-100 text-red-800" },
};

const currency = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
});

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const AbandonedCartsPage = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("carts");
  const [days, setDays] = useState(30);
  const [onlyContactable, setOnlyContactable] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["abandoned-carts", days, onlyContactable],
    queryFn: async () => {
      const [summary, list, products] = await Promise.all([
        abandonedCartsService.getSummary(days),
        abandonedCartsService.getList(days, onlyContactable),
        abandonedCartsService.getProductCartStats(days),
      ]);
      return { summary, list, products };
    },
    staleTime: 60 * 1000,
  });

  const summary = data?.summary;
  const carts = useMemo(() => data?.list ?? [], [data]);
  const products = useMemo(() => data?.products ?? [], [data]);

  const handleContact = async (cart: AbandonedCart) => {
    window.open(buildRecoveryLink(cart), "_blank", "noopener,noreferrer");
    try {
      await abandonedCartsService.markContacted(cart.sessionId);
      queryClient.invalidateQueries({ queryKey: ["abandoned-carts"] });
    } catch {
      // The message still went out; only the bookkeeping failed.
      toast.error("Opened WhatsApp but couldn't record the follow-up");
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Abandoned Carts"
          subtitle="Carts and checkouts that never became paid orders"
          icon={ShoppingCart}
        />
        <Card>
          <div className="py-10 text-center">
            <p className="text-sm text-red-600 font-medium">
              Couldn&apos;t load abandoned carts
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {(error as Error)?.message}
            </p>
            <p className="text-xs text-gray-400 mt-3">
              If this says the function is missing, run the
              20260803_tracking_abandoned_customers.sql migration.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Abandoned Carts"
        subtitle={`Carts inactive for ${STALE_AFTER_MINUTES}+ minutes that never became paid orders`}
        icon={ShoppingCart}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  onClick={() => setDays(option.days)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    days === option.days
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="rounded-xl w-10 h-10 p-0 flex items-center justify-center border-gray-200 hover:bg-gray-50 text-gray-600"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-header">
            <span className="stat-title">Money left behind</span>
            <div className="stat-icon">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="stat-value">
            {isLoading ? "—" : currency.format(summary?.stuckValue ?? 0)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Reachable</span>
            <div className="stat-icon">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="stat-value">
            {isLoading ? "—" : summary?.contactable ?? 0}
          </div>
          <div className="stat-trend">
            <span className="trend-text">
              {currency.format(summary?.contactableValue ?? 0)} with a phone or email
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Open carts</span>
            <div className="stat-icon">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <div className="stat-value">
            {isLoading ? "—" : summary?.openCarts ?? 0}
          </div>
          <div className="stat-trend">
            <span className="trend-text">
              avg {currency.format(summary?.avgCartValue ?? 0)}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Recovered</span>
            <div className="stat-icon">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <div className="stat-value">
            {isLoading ? "—" : summary?.recovered ?? 0}
          </div>
          <div className="stat-trend">
            <span className="trend-text">
              {currency.format(summary?.recoveredValue ?? 0)} won back
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("carts")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "carts"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Carts ({carts.length})
        </button>
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "products"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Most added to cart
        </button>
      </div>

      {tab === "carts" ? (
        <Card noPadding>
          <div className="content-header flex items-center justify-between">
            <h3 className="content-title flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recovery list
            </h3>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyContactable}
                onChange={(e) => setOnlyContactable(e.target.checked)}
                className="rounded border-gray-300"
              />
              Only carts I can contact
            </label>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : carts.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">No abandoned carts in this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Items</th>
                    <th className="px-6 py-3 font-medium">Value</th>
                    <th className="px-6 py-3 font-medium">Reached</th>
                    <th className="px-6 py-3 font-medium">Last seen</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {carts.map((cart) => {
                    const stage =
                      STAGE_LABELS[cart.furthestStage] ?? STAGE_LABELS.cart;
                    return (
                      <tr
                        key={cart.sessionId}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {cart.customerName || (
                              <span className="text-gray-400 italic">Unknown</span>
                            )}
                            {cart.isKnownCustomer && (
                              <span className="ms-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 align-middle">
                                returning
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">
                            {cart.phone || cart.email || "no contact"}
                          </div>
                          {cart.phone && cart.email && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              {cart.email}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">{cart.itemCount} item(s)</div>
                          <div className="text-xs text-gray-500 max-w-[220px] truncate">
                            {cart.items.map((i) => i.name).filter(Boolean).join("، ") ||
                              "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {currency.format(cart.subtotal)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${stage.className}`}
                          >
                            {stage.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {timeAgo(cart.lastActivityAt)}
                          {cart.contactCount > 0 && (
                            <div className="text-emerald-600 mt-0.5">
                              contacted {cart.contactCount}×
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {cart.phone ? (
                            <Button
                              size="sm"
                              onClick={() => handleContact(cart)}
                              className="rounded-lg bg-[#075E54] hover:bg-[#064d44] text-white gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp
                            </Button>
                          ) : cart.email ? (
                            <a
                              href={`mailto:${cart.email}`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Email
                            </a>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card noPadding>
          <div className="content-header">
            <h3 className="content-title flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Products by add-to-cart
            </h3>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Package size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">No cart activity recorded yet</p>
              <p className="text-xs mt-1">
                Data starts collecting from the moment tracking went live.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3 font-medium">#</th>
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium">Added</th>
                    <th className="px-6 py-3 font-medium">Removed</th>
                    <th className="px-6 py-3 font-medium">Bought</th>
                    <th className="px-6 py-3 font-medium">Cart → buy</th>
                    <th className="px-6 py-3 font-medium">Stuck in carts</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => {
                    // Wanted but not bought — usually price, shipping or trust.
                    const leaking =
                      product.addedToCart >= 5 && product.cartToPurchase < 20;
                    return (
                      <tr
                        key={product.productId || index}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {product.productName || (
                            <span className="text-gray-400 italic">Unknown product</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {product.addedToCart}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {product.removedFromCart}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{product.purchased}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              leaking
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {product.cartToPurchase}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {currency.format(product.stuckValue)}
                          {product.inAbandoned > 0 && (
                            <span className="text-xs text-gray-400 ms-1">
                              ({product.inAbandoned})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="px-6 py-4 text-xs text-gray-500 border-t border-gray-50">
                Rows highlighted in red get added to carts often but rarely bought —
                worth checking the price, shipping cost, or product photos.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AbandonedCartsPage;

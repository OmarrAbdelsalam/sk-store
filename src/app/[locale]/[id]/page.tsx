import { notFound, redirect } from "next/navigation";

/**
 * Old product links were /<id>. Those still work — a product id is sent on
 * to /product/<id> — while any other one-segment URL gets the real 404
 * instead of a broken product page.
 */
const PRODUCT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^\d+$/i;

export default async function LegacyProductRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (PRODUCT_ID.test(id)) redirect(`/product/${id}`);
  notFound();
}

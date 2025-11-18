import EmptyCartContent from "./EmptyCartContent";
import EmptyCartButton from "./EmptyCartButton";

export default function EmptyCart() {
  return (
    <div className="text-center space-y-6">
      <EmptyCartContent />
      <EmptyCartButton />
    </div>
  );
}

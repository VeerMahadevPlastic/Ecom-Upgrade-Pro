import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Package, ShoppingCart, ChevronRight, Leaf, Truck } from "lucide-react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetProduct } from "@workspace/api-client-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currency";
import { calculatePricing } from "@/lib/pricing";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useGetProduct(Number(id));
  const { addItem } = useCart();
  const { currency } = useCurrency();

  const [quantity, setQuantity] = useState<number>(0);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-5 w-48 mb-8" />
          <div className="grid md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground mb-4">Product not found.</p>
          <Button asChild variant="outline"><Link href="/products">Back to Products</Link></Button>
        </div>
      </Layout>
    );
  }

  const cartonQty = product.packingQty;
  const effectiveQty = quantity > 0 ? quantity : cartonQty;
  const pricing = calculatePricing(product, effectiveQty);
  const cartons = effectiveQty / product.packingQty;

  const handleAdd = () => {
    addItem(product, effectiveQty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const TIER_ROWS = [
    { label: "Retail (per piece)", qty: 1, price: product.pieceRate, discount: 0 },
    { label: "Bulk (1 carton)", qty: cartonQty, price: product.boxRate / product.packingQty, discount: 0 },
    { label: "10+ cartons", qty: cartonQty * 10, price: (product.boxRate / product.packingQty) * 0.97, discount: 3 },
    { label: "25+ cartons", qty: cartonQty * 25, price: (product.boxRate / product.packingQty) * 0.95, discount: 5 },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-foreground">Products</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium line-clamp-1 max-w-xs">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center p-8 border">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-contain w-full h-full"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex items-start gap-2 mb-1">
              {product.inStock
                ? <Badge className="bg-green-500 hover:bg-green-600">In Stock</Badge>
                : <Badge variant="destructive">Out of Stock</Badge>
              }
              <Badge variant="outline">{product.category}</Badge>
            </div>

            <h1 className="text-2xl font-extrabold leading-tight mt-3 mb-1">{product.name}</h1>
            <p className="text-sm font-mono text-muted-foreground mb-6">SKU: {product.sku}</p>

            {/* Pricing Table */}
            <div className="bg-muted/30 border rounded-xl overflow-hidden mb-6">
              <div className="px-4 py-2 bg-muted/50 border-b flex items-center gap-2 text-sm font-semibold">
                <Package className="h-4 w-4 text-primary" />
                Wholesale Pricing
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left px-4 py-2">Tier</th>
                    <th className="text-right px-4 py-2">Min Qty</th>
                    <th className="text-right px-4 py-2">Per Piece</th>
                    <th className="text-right px-4 py-2">Saving</th>
                  </tr>
                </thead>
                <tbody>
                  {TIER_ROWS.map((row, i) => (
                    <tr key={i} className={`border-b last:border-0 ${i === 0 ? "" : "text-foreground"}`}>
                      <td className="px-4 py-3 font-medium">{row.label}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{row.qty.toLocaleString()} pcs</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">{formatCurrency(row.price, currency)}</td>
                      <td className="px-4 py-3 text-right text-green-600 text-xs font-semibold">
                        {row.discount > 0 ? `-${row.discount}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Carton Calculator */}
            <div className="mb-6">
              <label className="text-sm font-semibold block mb-2 flex items-center gap-1">
                <Package className="h-4 w-4" />
                Carton Calculator
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={product.packingQty}
                  step={product.packingQty}
                  value={effectiveQty}
                  onChange={e => setQuantity(Math.max(product.packingQty, Number(e.target.value)))}
                  className="w-28 border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-sm text-muted-foreground">pcs =</span>
                <span className="text-sm font-bold">{cartons.toFixed(2)} carton{cartons !== 1 ? "s" : ""}</span>
              </div>
              <div className="mt-3 bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Unit price</span>
                  <span className="font-medium">{formatCurrency(pricing.pricePerPiece, currency)}/pc</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{effectiveQty.toLocaleString()} pcs</span>
                </div>
                {pricing.discountPercentage > 0 && (
                  <div className="flex justify-between mb-1">
                    <span className="text-green-600">Bulk discount</span>
                    <span className="font-medium text-green-600">-{pricing.discountPercentage}%</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-semibold">Total (INR Base)</span>
                  <span className="font-bold text-primary">{formatCurrency(pricing.totalAmount, currency)}</span>
                </div>
                {currency !== 'INR' && (
                  <p className="text-xs text-muted-foreground mt-1">FOB export terms</p>
                )}
                {currency === 'INR' && (
                  <p className="text-xs text-muted-foreground mt-1">+18% GST on final invoice</p>
                )}
              </div>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              className="h-12 font-bold text-base"
              disabled={!product.inStock || added}
              onClick={handleAdd}
            >
              {added ? "✓ Added to Cart" : <><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart</>}
            </Button>

            {/* Trust notes */}
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Leaf className="h-3.5 w-3.5 text-green-500" /> Eco-certified</span>
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Pan-India delivery</span>
              <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Factory direct</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

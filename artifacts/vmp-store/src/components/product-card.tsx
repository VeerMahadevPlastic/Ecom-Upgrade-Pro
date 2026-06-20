import { useState } from "react";
import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { formatCurrency } from "../lib/currency";
import { Button } from "./ui/button";
import { Check, ShoppingCart, Package } from "lucide-react";
import { Badge } from "./ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { currency } = useCurrency();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, product.packingQty); // Default to adding 1 master carton
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const bulkPricePerPiece = product.boxRate / product.packingQty;

  return (
    <Link href={`/products/${product.id}`} className="group relative bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Image Area */}
      <div className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center p-4">
        {product.inStock ? (
          <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">In Stock</Badge>
        ) : (
          <Badge variant="destructive" className="absolute top-2 left-2">Out of Stock</Badge>
        )}
        <div className="absolute top-2 right-2 text-xs font-medium bg-background/80 backdrop-blur px-2 py-1 rounded border shadow-sm">
          {product.category}
        </div>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-muted-foreground mb-1 font-mono">SKU: {product.sku}</div>
        <h3 className="font-bold text-base leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Pricing Table */}
        <div className="mt-auto bg-muted/30 rounded-md border p-3 mb-4">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-border/50 text-sm">
            <span className="text-muted-foreground">Retail (1pc)</span>
            <span className="font-medium">{formatCurrency(product.pieceRate, currency)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-primary flex items-center gap-1">
              <Package className="h-3 w-3" /> Bulk Rate
            </span>
            <div className="text-right">
              <span className="font-bold">{formatCurrency(bulkPricePerPiece, currency)}</span>
              <span className="text-xs text-muted-foreground block">per piece</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground text-right">
            Master Carton: {product.packingQty} pcs
          </div>
        </div>

        {/* Action */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock || added}
          className={`w-full font-bold transition-all ${added ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
        >
          {added ? (
            <span className="flex items-center justify-center gap-2"><Check className="h-4 w-4" /> Added to Cart</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><ShoppingCart className="h-4 w-4" /> Add 1 Carton</span>
          )}
        </Button>
      </div>
    </Link>
  );
}

import { Product } from "@workspace/api-client-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { calculatePricing } from "@/lib/pricing";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, X, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity } = useCart();
  const { currency } = useCurrency();

  const totalAmount = items.reduce((sum, item) => {
    const pricing = calculatePricing(item.product, item.quantity);
    return sum + pricing.totalAmount;
  }, 0);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({items.length} items)
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-sm mb-6">Browse our catalog to add products.</p>
              <Button onClick={() => setIsCartOpen(false)} asChild>
                <Link href="/products">View Products</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => {
              const pricing = calculatePricing(item.product, item.quantity);
              return (
                <div key={item.productId} className="flex gap-4 pb-6 border-b last:border-0 last:pb-0">
                  <div className="h-20 w-20 bg-muted rounded-md overflow-hidden shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">SKU: {item.product.sku}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 hover:bg-muted"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium border-x">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {formatCurrency(pricing.totalAmount, currency)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-1.5 rounded flex justify-between">
                      <span>{pricing.cartonCount.toFixed(2)} cartons</span>
                      {pricing.discountPercentage > 0 && (
                        <span className="text-primary font-medium">{pricing.discountPercentage}% bulk discount</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t bg-card">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Estimated Total</span>
              <span className="text-xl font-bold">{formatCurrency(totalAmount, currency)}</span>
            </div>
            {currency === 'INR' ? (
              <p className="text-xs text-muted-foreground mb-4">GST 18% applicable on invoice</p>
            ) : (
              <p className="text-xs text-muted-foreground mb-4">FOB Export Terms — Customs docs included</p>
            )}
            <Button className="w-full h-12 text-lg" onClick={() => setIsCartOpen(false)} asChild>
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

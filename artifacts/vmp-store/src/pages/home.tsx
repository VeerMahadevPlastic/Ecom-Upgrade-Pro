import { Link } from "wouter";
import { ArrowRight, Shield, Leaf, Globe, Award, ChevronRight } from "lucide-react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { useListProducts, useGetProductStats, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";

const TRUST_BADGES = [
  { icon: Shield, label: "ISO Certified", sub: "Quality Guaranteed" },
  { icon: Leaf, label: "Biodegradable", sub: "Eco-Friendly Products" },
  { icon: Globe, label: "Export Ready", sub: "Global Shipping" },
  { icon: Award, label: "Bulk Discounts", sub: "Up to 5% off" },
];

const HERO_FEATURES = [
  "Cornstarch & biodegradable packaging",
  "MOQ from 1 master carton",
  "Pan-India delivery + exports",
  "GST invoice provided",
];

export default function Home() {
  const { data: statsData } = useGetProductStats();
  const { data: categoriesData } = useListCategories();
  const { data: featuredData } = useListProducts({ limit: 8, offset: 0 });

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 rounded-full px-3 py-1 text-sm font-semibold mb-6">
              <Leaf className="h-4 w-4" />
              Biodegradable &amp; Plastic Food Packaging Manufacturer
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              B2B Packaging <br />
              <span className="text-primary">Made in India.</span>
            </h1>
            <p className="text-sidebar-foreground/70 text-lg mb-8 max-w-xl">
              Factory-direct wholesale prices on 100+ food packaging SKUs. Cornstarch trays, hinged boxes, PET/PP containers — all in stock.
            </p>
            <ul className="grid grid-cols-2 gap-2 mb-8 text-sm text-sidebar-foreground/80">
              {HERO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="font-bold text-base h-12 px-8">
                <Link href="/products">
                  Browse Catalog <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold text-base h-12 px-8 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
                <a href="https://wa.me/918050389261" target="_blank" rel="noopener noreferrer">
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        {statsData && (
          <div className="border-t border-sidebar-border">
            <div className="container mx-auto px-4 py-4 flex flex-wrap gap-6 items-center text-sm text-sidebar-foreground/70">
              <span className="font-bold text-sidebar-foreground text-2xl">{statsData.totalProducts}+</span>
              <span>Products</span>
              <span className="text-sidebar-border">|</span>
              <span className="font-bold text-sidebar-foreground text-2xl">{statsData.totalCategories}</span>
              <span>Categories</span>
              <span className="text-sidebar-border">|</span>
              <span>Pan-India Delivery</span>
              <span className="text-sidebar-border">|</span>
              <span>Export-Ready</span>
            </div>
          </div>
        )}
      </section>

      {/* Trust badges */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 p-4 rounded-lg bg-card border hover:border-primary/30 transition-colors">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categoriesData && categoriesData.categories.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Browse by Category</h2>
              <Link href="/products" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
                All Products <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {categoriesData.categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="bg-card border hover:border-primary/50 hover:shadow-md transition-all rounded-lg p-4 group"
                >
                  <div className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">{cat.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{cat.productCount} products</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredData && featuredData.products.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Popular Products</h2>
              <Link href="/products" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredData.products.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-16 bg-primary/5 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to place a bulk order?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Add products to your cart and send us a WhatsApp enquiry in seconds. No account needed.
          </p>
          <Button asChild size="lg" className="font-bold text-base h-12 px-10">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

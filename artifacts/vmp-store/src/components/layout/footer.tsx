import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground font-bold px-2 py-1 rounded text-sm tracking-wider">
                VMP
              </div>
              <span className="font-semibold text-lg tracking-tight">
                Veer Mahadev Plastic
              </span>
            </div>
            <p className="text-sidebar-foreground/70 text-sm mb-6 leading-relaxed">
              India's premier manufacturer and wholesaler of high-quality food packaging, exporting globally since 2024.
            </p>
            <div className="text-sm">
              <p className="font-medium text-sidebar-foreground mb-1">Contact Us</p>
              <p className="text-sidebar-foreground/70 mb-1">WhatsApp: +91 99999 99999</p>
              <p className="text-sidebar-foreground/70">Email: sales@vmpworld.com</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sidebar-foreground">Categories</h3>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li><Link href="/products?category=meal-trays" className="hover:text-primary transition-colors">Meal Trays (CP)</Link></li>
              <li><Link href="/products?category=containers" className="hover:text-primary transition-colors">Food Containers</Link></li>
              <li><Link href="/products?category=bakery" className="hover:text-primary transition-colors">Bakery Packaging</Link></li>
              <li><Link href="/products?category=glasses" className="hover:text-primary transition-colors">Plastic Glasses</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">View All Products</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sidebar-foreground">Company</h3>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Manufacturing Plant</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Export & Shipping</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Trade</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sidebar-foreground">Global Export Ready</h3>
            <p className="text-sm text-sidebar-foreground/70 mb-4">
              We ship FOB/CIF globally. All products are manufactured in highly sanitized environments compliant with international standards.
            </p>
            <div className="bg-sidebar-accent p-4 rounded-md border border-sidebar-border">
              <p className="text-xs font-medium text-sidebar-foreground mb-2">FACTORY DIRECT PRICING</p>
              <p className="text-xs text-sidebar-foreground/70">Save up to 40% when ordering FCL (Full Container Loads).</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-sidebar-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-sidebar-foreground/60">
            © {new Date().getFullYear()} Veer Mahadev Plastic. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-sidebar-foreground/60">
            <span>Prices exclusive of taxes where applicable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

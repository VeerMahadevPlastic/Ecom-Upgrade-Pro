import { Link } from "wouter";
import { MapPin, Phone, Mail } from "lucide-react";
import logoUrl from "/vm-plastic-logo.png";

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoUrl} alt="VM Plastic Logo" className="h-12 w-12 object-contain rounded-full" />
              <div>
                <div className="font-bold text-base leading-tight">Veer Mahadev</div>
                <div className="font-bold text-base leading-tight text-primary">Plastic</div>
              </div>
            </div>
            <p className="text-sidebar-foreground/70 text-sm mb-6 leading-relaxed">
              India's premier manufacturer and wholesaler of high-quality food packaging, exporting globally.
            </p>
            <div className="text-sm space-y-2">
              <p className="font-medium text-sidebar-foreground">Contact Us</p>
              <a
                href="https://wa.me/918050389261"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sidebar-foreground/70 hover:text-primary transition-colors"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                +91 80503 89261
              </a>
              <a
                href="mailto:veermahadevplastic@gmail.com"
                className="flex items-center gap-2 text-sidebar-foreground/70 hover:text-primary transition-colors"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                veermahadevplastic@gmail.com
              </a>
              <div className="flex items-start gap-2 text-sidebar-foreground/70">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>Piller No 74, Umiya Nagar, Rabari Colony, Amraiwadi, Ahmedabad, Gujarat 382415</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sidebar-foreground">Categories</h3>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li><Link href="/products?category=cornstarch-meal-tray-lid" className="hover:text-primary transition-colors">Cornstarch Meal Trays</Link></li>
              <li><Link href="/products?category=cornstarch-container" className="hover:text-primary transition-colors">Cornstarch Containers</Link></li>
              <li><Link href="/products?category=bakery-hinged" className="hover:text-primary transition-colors">Bakery Packaging</Link></li>
              <li><Link href="/products?category=biodegradable-glass-bowl" className="hover:text-primary transition-colors">Biodegradable Glasses</Link></li>
              <li><Link href="/products?category=pet-pp-container" className="hover:text-primary transition-colors">PET & PP Containers</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">View All Products →</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sidebar-foreground">Company</h3>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Manufacturing Plant</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Export & Shipping</Link></li>
              <li>
                <a
                  href="https://maps.google.com/?q=Piller+No+74+Umiya+Nagar+Rabari+Colony+Amraiwadi+Ahmedabad+Gujarat+382415"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Find Us on Maps
                </a>
              </li>
              <li>
                <a
                  href="mailto:veermahadevplastic@gmail.com"
                  className="hover:text-primary transition-colors"
                >
                  Email Enquiry
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sidebar-foreground">Global Export Ready</h3>
            <p className="text-sm text-sidebar-foreground/70 mb-4">
              We ship FOB/CIF globally. All products manufactured in highly sanitized environments compliant with international standards.
            </p>
            <div className="bg-sidebar-accent p-4 rounded-md border border-sidebar-border">
              <p className="text-xs font-medium text-sidebar-foreground mb-2">FACTORY DIRECT PRICING</p>
              <p className="text-xs text-sidebar-foreground/70">Save up to 5% when ordering 25+ cartons. FCL pricing available on request.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-sidebar-foreground/60">
            © {new Date().getFullYear()} Veer Mahadev Plastic. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-sidebar-foreground/60">
            <span>Prices exclusive of GST & taxes where applicable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

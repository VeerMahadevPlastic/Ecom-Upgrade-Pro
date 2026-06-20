import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MessageCircle, ArrowLeft, ChevronRight, Package, User, MapPin, Check, Pencil, UserCheck } from "lucide-react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currency";
import { calculatePricing } from "@/lib/pricing";
import { useSubmitEnquiry } from "@workspace/api-client-react";

const STEPS = ["Cart Review", "Your Details", "Confirm & WhatsApp"];
const PROFILE_KEY = "vmp_customer_profile";

type CustomerProfile = {
  customerName: string;
  mobile: string;
  businessName: string;
  gstin: string;
  address: string;
  district: string;
  pincode: string;
};

function loadProfile(): CustomerProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(data: CustomerProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const { items, clearCart } = useCart();
  const { currency } = useCurrency();
  const { mutateAsync: createEnquiry, isPending } = useSubmitEnquiry();

  const savedProfile = loadProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(!savedProfile);

  const [form, setForm] = useState({
    customerName: savedProfile?.customerName ?? "",
    mobile: savedProfile?.mobile ?? "",
    businessName: savedProfile?.businessName ?? "",
    gstin: savedProfile?.gstin ?? "",
    address: savedProfile?.address ?? "",
    district: savedProfile?.district ?? "",
    pincode: savedProfile?.pincode ?? "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalAmount = items.reduce((sum, item) => {
    return sum + calculatePricing(item.product, item.quantity).totalAmount;
  }, 0);

  const handleField = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: "" }));
  };

  const validateDetails = () => {
    const errs: Record<string, string> = {};
    if (!form.customerName.trim()) errs.customerName = "Name is required";
    if (!form.mobile.match(/^[6-9]\d{9}$/)) errs.mobile = "Enter valid 10-digit mobile";
    if (!form.address.trim()) errs.address = "Address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateDetails()) { setStep(1); return; }
    try {
      const res = await createEnquiry({
        data: {
          customerName: form.customerName,
          mobile: form.mobile,
          businessName: form.businessName || undefined,
          gstin: form.gstin || undefined,
          address: form.address,
          district: form.district || undefined,
          pincode: form.pincode || undefined,
          currency,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          totalAmount,
          notes: form.notes || undefined,
        }
      });
      // Save profile for next visit
      saveProfile({
        customerName: form.customerName,
        mobile: form.mobile,
        businessName: form.businessName,
        gstin: form.gstin,
        address: form.address,
        district: form.district,
        pincode: form.pincode,
      });
      clearCart();
      window.open(res.whatsappUrl, "_blank");
      setLocation("/");
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some products before checking out.</p>
          <Button onClick={() => setLocation("/products")}>Browse Products</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <button onClick={() => step > 0 ? setStep(step - 1) : setLocation("/products")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="text-2xl font-bold mb-2">Checkout</h1>
        <p className="text-sm text-muted-foreground mb-8">Your enquiry will be sent via WhatsApp for quick confirmation.</p>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 text-sm font-medium ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < step ? "bg-primary border-primary text-primary-foreground" : i === step ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground"}`}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Cart Review */}
        {step === 0 && (
          <div>
            <div className="bg-card border rounded-xl overflow-hidden mb-6">
              {items.map(item => {
                const p = calculatePricing(item.product, item.quantity);
                return (
                  <div key={item.productId} className="flex gap-4 p-4 border-b last:border-0">
                    <img src={item.product.imageUrl} alt={item.product.name} className="h-16 w-16 object-contain rounded-lg bg-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm line-clamp-1">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">SKU: {item.product.sku}</div>
                      <div className="text-xs text-muted-foreground">{item.quantity} pcs ({(item.quantity / item.product.packingQty).toFixed(2)} cartons)</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm">{formatCurrency(p.totalAmount, currency)}</div>
                      {p.discountPercentage > 0 && <div className="text-xs text-green-600">-{p.discountPercentage}%</div>}
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between p-4 bg-muted/30 font-bold">
                <span>Estimated Total</span>
                <span className="text-primary">{formatCurrency(totalAmount, currency)}</span>
              </div>
            </div>
            {currency === 'INR' && <p className="text-xs text-muted-foreground mb-6">GST 18% will be added on the final invoice</p>}
            {currency !== 'INR' && <p className="text-xs text-muted-foreground mb-6">FOB export terms. Customs docs &amp; clearance included.</p>}
            <Button className="w-full h-12 font-bold text-base" onClick={() => setStep(1)}>
              Continue <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div>
            {/* Saved profile banner */}
            {savedProfile && !isEditingProfile && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <UserCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Details pre-filled from your last order</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {form.customerName} · {form.mobile}{form.businessName ? ` · ${form.businessName}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1.5 rounded-lg shrink-0 transition-colors"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              </div>
            )}

            {(!savedProfile || isEditingProfile) && (
              <div className="bg-card border rounded-xl p-6 mb-6 space-y-4">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <User className="h-4 w-4 text-primary" />
                  Contact Details
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Full Name *</label>
                    <input
                      value={form.customerName}
                      onChange={e => handleField("customerName", e.target.value)}
                      placeholder="Your name"
                      className={`w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring ${errors.customerName ? "border-destructive" : ""}`}
                    />
                    {errors.customerName && <p className="text-xs text-destructive mt-1">{errors.customerName}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Mobile *</label>
                    <input
                      value={form.mobile}
                      onChange={e => handleField("mobile", e.target.value)}
                      placeholder="10-digit mobile"
                      maxLength={10}
                      className={`w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring ${errors.mobile ? "border-destructive" : ""}`}
                    />
                    {errors.mobile && <p className="text-xs text-destructive mt-1">{errors.mobile}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Business Name</label>
                    <input
                      value={form.businessName}
                      onChange={e => handleField("businessName", e.target.value)}
                      placeholder="Optional"
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  {currency === 'INR' && (
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-muted-foreground block mb-1">GSTIN</label>
                      <input
                        value={form.gstin}
                        onChange={e => handleField("gstin", e.target.value)}
                        placeholder="For GST invoice"
                        className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 flex items-center gap-2 font-semibold mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Delivery Address
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Address *</label>
                    <textarea
                      value={form.address}
                      onChange={e => handleField("address", e.target.value)}
                      placeholder="Full delivery address"
                      rows={3}
                      className={`w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none ${errors.address ? "border-destructive" : ""}`}
                    />
                    {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">District</label>
                    <input
                      value={form.district}
                      onChange={e => handleField("district", e.target.value)}
                      placeholder="District"
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Pincode</label>
                    <input
                      value={form.pincode}
                      onChange={e => handleField("pincode", e.target.value)}
                      placeholder="Pincode"
                      maxLength={6}
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {savedProfile && isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(false)} className="text-xs text-muted-foreground hover:text-foreground underline">
                    Cancel editing
                  </button>
                )}
              </div>
            )}

            {/* Notes always visible */}
            <div className="bg-card border rounded-xl p-4 mb-6">
              <label className="text-xs font-medium text-muted-foreground block mb-1">Special Notes / Requirements</label>
              <textarea
                value={form.notes}
                onChange={e => handleField("notes", e.target.value)}
                placeholder="Special requirements, packing preferences, delivery instructions..."
                rows={2}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <Button
              className="w-full h-12 font-bold text-base"
              onClick={() => { if (validateDetails()) setStep(2); }}
            >
              Review Order <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <div>
            <div className="bg-card border rounded-xl p-6 mb-6 space-y-4">
              <h3 className="font-semibold">Order Summary</h3>
              {items.map(item => {
                const p = calculatePricing(item.product, item.quantity);
                return (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1 mr-4">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium shrink-0">{formatCurrency(p.totalAmount, currency)}</span>
                  </div>
                );
              })}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalAmount, currency)}</span>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6 mb-6 space-y-2 text-sm">
              <h3 className="font-semibold mb-2">Your Details</h3>
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{form.customerName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mobile</span><span>{form.mobile}</span></div>
              {form.businessName && <div className="flex justify-between"><span className="text-muted-foreground">Business</span><span>{form.businessName}</span></div>}
              {form.gstin && <div className="flex justify-between"><span className="text-muted-foreground">GSTIN</span><span className="font-mono text-xs">{form.gstin}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="text-right max-w-[60%]">{form.address}{form.district ? `, ${form.district}` : ""}{form.pincode ? ` - ${form.pincode}` : ""}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span>{currency}</span></div>
              <button onClick={() => setStep(1)} className="text-xs text-primary hover:underline mt-1 block">Edit details</button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800">
              <p className="font-semibold mb-1 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Sends via WhatsApp
              </p>
              <p>Clicking the button below will open WhatsApp with your full order pre-filled. Our team will confirm within 24 hours.</p>
            </div>

            <Button
              className="w-full h-12 font-bold text-base bg-[#25D366] hover:bg-[#1ebe5c] text-white"
              disabled={isPending}
              onClick={handleSubmit}
            >
              {isPending ? "Sending..." : (
                <><MessageCircle className="mr-2 h-5 w-5" /> Send Enquiry via WhatsApp</>
              )}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}

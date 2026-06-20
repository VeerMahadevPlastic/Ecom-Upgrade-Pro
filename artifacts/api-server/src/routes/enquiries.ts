import { Router } from "express";
import { db, enquiriesTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const WHATSAPP_NUMBER = "918050389261";

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  GBP: "£",
  TRY: "₺",
  RUB: "₽",
};

const CURRENCY_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0095,
  TRY: 0.39,
  RUB: 1.05,
};

function formatWhatsAppMessage(enquiry: {
  id: number;
  customerName: string;
  mobile: string;
  businessName?: string | null;
  gstin?: string | null;
  address: string;
  district?: string | null;
  pincode?: string | null;
  currency: string;
  items: Array<{ productId: number; quantity: number; productName?: string; pieceRate?: number; packingQty?: number }>;
  totalAmount: number;
  notes?: string | null;
}): string {
  const sym = CURRENCY_SYMBOLS[enquiry.currency] ?? enquiry.currency;
  const rate = CURRENCY_RATES[enquiry.currency] ?? 1;
  const isExport = enquiry.currency !== "INR";

  let msg = `*VEER MAHADEV PLASTIC - B2B ORDER ENQUIRY*\n`;
  msg += `*Enquiry #${enquiry.id}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `*CUSTOMER DETAILS*\n`;
  msg += `Name: ${enquiry.customerName}\n`;
  msg += `Mobile: ${enquiry.mobile}\n`;
  if (enquiry.businessName) msg += `Business: ${enquiry.businessName}\n`;
  if (enquiry.gstin) msg += `GSTIN: ${enquiry.gstin}\n`;
  msg += `Address: ${enquiry.address}`;
  if (enquiry.district) msg += `, ${enquiry.district}`;
  if (enquiry.pincode) msg += ` - ${enquiry.pincode}`;
  msg += `\n\n`;

  msg += `*ORDER ITEMS*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;

  enquiry.items.forEach((item, idx) => {
    const cartons = item.packingQty ? Math.ceil(item.quantity / item.packingQty) : 0;
    const priceConverted = item.pieceRate ? (item.pieceRate * rate).toFixed(2) : "N/A";
    msg += `${idx + 1}. ${item.productName ?? `Product #${item.productId}`}\n`;
    msg += `   Qty: ${item.quantity} pcs`;
    if (cartons > 0) msg += ` (${cartons} carton${cartons > 1 ? "s" : ""})`;
    msg += `\n   Rate: ${sym}${priceConverted}/pc\n`;
  });

  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  const totalConverted = (enquiry.totalAmount * rate).toFixed(2);
  msg += `*TOTAL: ${sym}${totalConverted}*\n\n`;

  if (isExport) {
    msg += `Terms: FOB Export - Customs docs & clearance included\n`;
    msg += `Currency: ${enquiry.currency}\n`;
  } else {
    msg += `GST: 18% applicable on final invoice\n`;
  }

  if (enquiry.notes) {
    msg += `\nNotes: ${enquiry.notes}\n`;
  }

  msg += `\n_Please confirm this quotation request. Our team will revert within 24 hours._`;

  return msg;
}

router.post("/enquiries", async (req, res) => {
  const { customerName, mobile, businessName, gstin, address, district, pincode, currency = "INR", items, totalAmount, notes } = req.body;

  if (!customerName || !mobile || !address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Missing required fields: customerName, mobile, address, items" });
  }

  // Enrich items with product data
  const productIds = items.map((i: { productId: number }) => i.productId);
  const products = await db.select().from(productsTable).where(
    productIds.length === 1
      ? eq(productsTable.id, productIds[0])
      : eq(productsTable.id, productIds[0]) // fallback — will loop below
  );

  const productMap: Record<number, typeof products[0]> = {};
  for (const pid of productIds) {
    const found = await db.select().from(productsTable).where(eq(productsTable.id, pid)).limit(1);
    if (found[0]) productMap[pid] = found[0];
  }

  const enrichedItems = items.map((item: { productId: number; quantity: number }) => ({
    ...item,
    productName: productMap[item.productId]?.name ?? `Product #${item.productId}`,
    pieceRate: productMap[item.productId] ? parseFloat(productMap[item.productId].pieceRate) : undefined,
    packingQty: productMap[item.productId]?.packingQty ?? undefined,
  }));

  const [enquiry] = await db.insert(enquiriesTable).values({
    customerName,
    mobile,
    businessName: businessName ?? null,
    gstin: gstin ?? null,
    address,
    district: district ?? null,
    pincode: pincode ?? null,
    currency,
    items,
    totalAmount: String(totalAmount),
    notes: notes ?? null,
  }).returning();

  const whatsappMsg = formatWhatsAppMessage({
    id: enquiry.id,
    customerName: enquiry.customerName,
    mobile: enquiry.mobile,
    businessName: enquiry.businessName,
    gstin: enquiry.gstin,
    address: enquiry.address,
    district: enquiry.district,
    pincode: enquiry.pincode,
    currency: enquiry.currency,
    items: enrichedItems,
    totalAmount: parseFloat(enquiry.totalAmount),
    notes: enquiry.notes,
  });

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`;

  res.status(201).json({
    id: enquiry.id,
    customerName: enquiry.customerName,
    mobile: enquiry.mobile,
    businessName: enquiry.businessName ?? null,
    gstin: enquiry.gstin ?? null,
    address: enquiry.address,
    district: enquiry.district ?? null,
    pincode: enquiry.pincode ?? null,
    currency: enquiry.currency,
    items,
    totalAmount: parseFloat(enquiry.totalAmount),
    notes: enquiry.notes ?? null,
    createdAt: enquiry.createdAt.toISOString(),
    whatsappUrl,
  });
});

export default router;
